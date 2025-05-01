import { FrameMessageType, ReseponseMessageType, WorkerMessageType } from "@/types/WorkerMessageType";
import useOffscreen from "@hooks/useOffscreen";
import useWorker from "@hooks/useWorker";
import { getVideoFrameInfo } from "@utils/mp4BoxUtils";
import { ChangeEvent, useRef, useState } from "react";
import { ResponseCodeEnum } from "@/constants/ResponseCodeEnum";
import { PlayStatusEnum } from "@/constants/PlayStatusEnum";
import PlayerWorker from "@/workers/playerWorker?worker&url";
import useSyncTime from "@hooks/useSyncTime";

function VideoPlayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPlayStatus, setCurrentPlayStatus] = useState<PlayStatusEnum>(PlayStatusEnum.STOP);
  // todo: isOffcanvasTransferred, isVideoFrameInfoAcked, isTimestampAcked 과도한 것 같은데 하나의 state로 줄여도 될지 고민할 것
  const [isOffcanvasTransferred, setIsOffcanvasTransferred] = useState(false);
  const [isVideoFrameInfoAcked, setIsVideoFrameInfoAcked] = useState(false);
  const [isTimestampAcked, setIsTimestampAcked] = useState(false);
  const isPlayable = isOffcanvasTransferred && isVideoFrameInfoAcked && isTimestampAcked;

  const { workerRef, isWorkerReady } = useWorker({
    path: PlayerWorker,
    onmessage: (e) => {
      const msg = e.data as ReseponseMessageType
      switch (msg.code) {
        case ResponseCodeEnum.VIDEO_PLAY:
          setCurrentPlayStatus(PlayStatusEnum.PLAY)
          return
        case ResponseCodeEnum.VIDEO_STOP:
          setCurrentPlayStatus(PlayStatusEnum.STOP)
          return
        case ResponseCodeEnum.OFFCANVAS_ACKED:
          setIsOffcanvasTransferred(true)
          return
        case ResponseCodeEnum.FRAME_INFO_ACKED:
          setIsVideoFrameInfoAcked(true)
          return
        case ResponseCodeEnum.TIMESTAMP_ACKED:
          setIsTimestampAcked(true)
          return
      }
      switch (msg.code) {
        case ResponseCodeEnum.NO_CANVAS:
          setIsOffcanvasTransferred(false);
          alert("캔버스 찾을 수 없음")
          return
        case ResponseCodeEnum.NO_FRAME_INFO:
          setIsVideoFrameInfoAcked(false);
          alert("프레임 정보 없음")
          return
        case ResponseCodeEnum.NO_TIMESTAMP_INFO:
          setIsTimestampAcked(false);
          alert("시계 동기화 되지 않았음")
          return
      }
    }
  })
  useOffscreen({ canvasRef, workerRef, isWorkerReady })
  useSyncTime({ workerRef, isWorkerReady })

  const handlePlayClick = () => {
    const msg: WorkerMessageType = {
      type: "command",
      command: currentPlayStatus === PlayStatusEnum.PLAY ? "stop": "play"
    }
    workerRef.current?.postMessage(msg)
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const worker = workerRef.current;
    if (!file || !worker) { return }
    // todo: demuxing 실패에 대한 핸들링
    const { videoFrames, frameRate } = await getVideoFrameInfo(file);
    const msg: FrameMessageType = {
      type: "frame",
      videoFrames,
      frameRate
    };
    // todo: videoFrames를 deep clone 하지않고 그대로 transfer하는 방법을 고민할 것
    worker.postMessage(msg);
    videoFrames.forEach(videoFrame => videoFrame.close())  // todo: videoFrames를 transfer할 경우 여기서 close하면 안될 것으로 예상된다
  }

  return (
    <div>
      <canvas ref={canvasRef} style={{width: "100%", backgroundColor: "black"}} />
      <button onClick={handlePlayClick} disabled={!isPlayable}>{currentPlayStatus === PlayStatusEnum.PLAY ? "STOP" : "PLAY"}</button>
      <input type="file" accept="video/mp4" onChange={handleFileChange} />
    </div>
  );
}

export default VideoPlayer