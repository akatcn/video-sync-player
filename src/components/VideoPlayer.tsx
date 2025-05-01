import { FrameMessageType, ReseponseMessageType, WorkerMessageType } from "@/types/WorkerMessageType";
import useOffscreen from "@hooks/useOffscreen";
import useWorker from "@hooks/useWorker";
import { getVideoFrameInfo } from "@utils/mp4BoxUtils";
import { ChangeEvent, useRef, useState } from "react";
import { ResponseCodeEnum } from "@/constants/ResponseCodeEnum";
import { PlayStatusEnum } from "@/constants/PlayStatusEnum";
import PlayerWorker from "@/worker/playerWorker?worker&url"

// todo: 싱크 맞추기 Hook(useSyncTime)으로 옮길 것
const getTimestamp = async () => {
  const requestAt = performance.now()
  /* --------------------- */
  const response = await fetch(`http://localhost:3000/time`);  // todo: 에러 핸들링
  const body = await response.json();  // todo: response 타입 정의
  const { timeStamp } = body
  const tServer = timeStamp
  /* --------------------- */
  const receivedAt = performance.now()

  // 임시 데이터
  return {
    tServer,
    timeOrigin: performance.timeOrigin,
    receivedAt,
    rtt: receivedAt - requestAt
  }
}

// todo: 싱크 맞추기 Hook(useSyncTime)으로 옮길 것
const getServerTime = (tServer: number, rtt: number) => {
  return tServer + (rtt / 2)
}

function VideoPlayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPlayStatus, setCurrentPlayStatus] = useState<PlayStatusEnum>(PlayStatusEnum.STOP);
  const [isOffcanvasTransferred, setIsOffcanvasTransferred] = useState(false);
  const [isVideoFrameInfoAcked, setIsVideoFrameInfoAcked] = useState(false);
  const [isTimestampAcked, setIsTimestampAcked] = useState(false);
  const { workerRef, willWorkerSurvive } = useWorker(PlayerWorker, (e) => {
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
  })
  useOffscreen({ canvasRef, workerRef, willWorkerSurvive })

  const isPlayable = isOffcanvasTransferred && isVideoFrameInfoAcked && isTimestampAcked;

  // todo: interval을 두고 싱크 맞춰지도록 할 것(별도의 Hook(useSyncTime??) 정의)
  const handleSyncClick = async () => {
    const worker = workerRef.current;
    if (!worker) { return }
    const { tServer, timeOrigin, receivedAt, rtt } = await getTimestamp()
    const estimatedServerTime = getServerTime(tServer, rtt)
    const msg: WorkerMessageType = {
      type: "timestamp",
      estimatedServerTime,
      mainTimeOrigin: timeOrigin,
      mainReceivedAt: receivedAt
    }
    worker.postMessage(msg)
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
      <button onClick={handleSyncClick}>SYNC</button>  {/* 싱크 맞추기 Hook(useSyncTime) 정의되면 제거할 것 */}
      <button onClick={handlePlayClick} disabled={!isPlayable}>{currentPlayStatus === PlayStatusEnum.PLAY ? "STOP" : "PLAY"}</button>
      <input type="file" accept="video/mp4" onChange={handleFileChange} />
    </div>
  );
}

export default VideoPlayer