import { FrameMessageType, ReseponseMessageType, WorkerMessageType } from "@/types/WorkerMessageType";
import useOffscreen from "@hooks/useOffscreen";
import useWorker from "@hooks/useWorker";
import { getVideoFrameInfo } from "@utils/mp4BoxUtils";
import { ChangeEvent, useRef, useState } from "react";
import { ResponseCodeEnum } from "@/constants/ResponseCodeEnum";
import { PlayStatusEnum } from "@/constants/PlayStatusEnum";

const WORKER_PATH = "/src/worker/playerWorker.ts"

function VideoPlayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPlayStatus, setCurrentPlayStatus] = useState<PlayStatusEnum>(PlayStatusEnum.STOP);
  const [isOffcanvasTransferred, setIsOffcanvasTransferred] = useState(false);
  const [isVideoFrameInfoAcked, setIsVideoFrameInfoAcked] = useState(false);
  const [isTimestampAcked, setIsTimestampAcked] = useState(false);
  const { workerRef, willWorkerSurvive } = useWorker(WORKER_PATH, (e) => {
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
      case ResponseCodeEnum.NO_TIMESTAMP:
        setIsTimestampAcked(false);
        alert("시계 동기화 되지 않았음")
        return
    }
  })
  useOffscreen({ canvasRef, workerRef, willWorkerSurvive })

  const isPlayable = isOffcanvasTransferred && isVideoFrameInfoAcked && isTimestampAcked;

  const handleSyncClick = () => {
    const msg: WorkerMessageType = {
      type: "timestamp",
      timestamp: 0
    }
    workerRef.current?.postMessage(msg)
  }

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
    const { videoFrames, frameRate } = await getVideoFrameInfo(file);
    const msg: FrameMessageType = {
      type: "frame",
      videoFrames,
      frameRate
    };
    worker.postMessage(msg);
  }

  return (
    <div>
      <canvas ref={canvasRef} style={{width: "100%", backgroundColor: "black"}} />
      <button onClick={handleSyncClick}>SYNC</button>
      <button onClick={handlePlayClick} disabled={!isPlayable}>{currentPlayStatus === PlayStatusEnum.PLAY ? "STOP" : "PLAY"}</button>
      <input type="file" accept="video/mp4" onChange={handleFileChange} />
    </div>
  );
}

export default VideoPlayer