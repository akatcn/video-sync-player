import { PlayStatusEnum } from "@/constants/PlayStatusEnum";
import { ResponseCodeEnum } from "@/constants/ResponseCodeEnum";
import {
  FrameMessage,
  ReseponseMessage,
  WorkerMessage,
} from "@/types/WorkerMessage.type";
import GlobalFooter from "@components/GlobalFooter";
import GlobalNavigation from "@components/GlobalNavigation";
import ThemeProvider from "@components/providers/ThemeProvider";
import VideoControlPanel from "@components/VideoControlPanel";
import VideoPlayer from "@components/VideoPlayer";
import useOffscreenCanvas from "@hooks/useOffscreenCanvas";
import useSyncTime from "@hooks/useSyncTime";
import useWorker from "@hooks/useWorker";
import { getVideoFrameInfo } from "@utils/mp4BoxUtils";
import { useRef, useState } from "react";
import PlayerWorker from "@/workers/playerWorker?worker&url";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPlayStatus, setCurrentPlayStatus] = useState<PlayStatusEnum>(
    PlayStatusEnum.STOP,
  );
  const [isOffcanvasTransferred, setIsOffcanvasTransferred] = useState(false);
  const [isVideoFrameInfoAcked, setIsVideoFrameInfoAcked] = useState(false);
  const [isTimestampAcked, setIsTimestampAcked] = useState(false);

  const { workerRef, isWorkerReady } = useWorker({
    path: PlayerWorker,
    onmessage: (e) => {
      const msg = e.data as ReseponseMessage;
      switch (msg.code) {
        case ResponseCodeEnum.VIDEO_PLAY:
          setCurrentPlayStatus(PlayStatusEnum.PLAY);
          break;
        case ResponseCodeEnum.VIDEO_STOP:
          setCurrentPlayStatus(PlayStatusEnum.STOP);
          break;
        case ResponseCodeEnum.OFFCANVAS_ACKED:
          setIsOffcanvasTransferred(true);
          break;
        case ResponseCodeEnum.FRAME_INFO_ACKED:
          setIsVideoFrameInfoAcked(true);
          break;
        case ResponseCodeEnum.TIMESTAMP_ACKED:
          setIsTimestampAcked(true);
          break;
        case ResponseCodeEnum.NO_CANVAS:
          setIsOffcanvasTransferred(false);
          alert("캔버스 찾을 수 없음");
          break;
        case ResponseCodeEnum.NO_FRAME_INFO:
          setIsVideoFrameInfoAcked(false);
          alert("프레임 정보 없음");
          break;
        case ResponseCodeEnum.NO_TIMESTAMP_INFO:
          setIsTimestampAcked(false);
          alert("시계 동기화 되지 않았음");
          break;
        default:
          alert("알 수 없는 에러");
      }
    },
  });
  useOffscreenCanvas({ canvasRef, workerRef, isWorkerReady });
  useSyncTime({ workerRef, isWorkerReady });

  const playVideo = () => {
    const msg: WorkerMessage = {
      type: "command",
      command: currentPlayStatus === PlayStatusEnum.PLAY ? "stop" : "play",
    };
    workerRef.current?.postMessage(msg);
  };

  const loadVideoFramesToWorker = async (file: File) => {
    // todo: demuxing 실패에 대한 핸들링
    if (!workerRef.current) return;
    const worker = workerRef.current;
    const { videoFrames, frameRate } = await getVideoFrameInfo(file);
    const msg: FrameMessage = {
      type: "frame",
      videoFrames,
      frameRate,
    };
    // todo: videoFrames를 deep clone 하지않고 그대로 transfer하는 방법을 고민할 것
    worker.postMessage(msg);
    videoFrames.forEach((videoFrame) => videoFrame.close()); // todo: videoFrames를 transfer할 경우 여기서 close하면 안될 것으로 예상된다
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <main className="flex flex-col h-full">
        <GlobalNavigation />
        <div className="flex-1 px-6 pt-6 flex gap-x-6">
          <VideoPlayer canvasRef={canvasRef} />
          <VideoControlPanel
            isPlayable={
              isOffcanvasTransferred &&
              isVideoFrameInfoAcked &&
              isTimestampAcked
            }
            currentPlayStatus={currentPlayStatus}
            onPlayClick={playVideo}
            onFileChange={loadVideoFramesToWorker}
          />
        </div>
        <GlobalFooter />
      </main>
    </ThemeProvider>
  );
}

export default App;
