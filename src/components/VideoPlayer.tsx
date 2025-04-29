import { FrameMessageType } from "@/types/WorkerMessageType";
import useOffscreen from "@hooks/useOffscreen";
import useWorker from "@hooks/useWorker";
import { getVideoFrameInfo } from "@utils/mp4BoxUtils";
import { ChangeEvent, useRef } from "react";

const WORKER_PATH = "/src/worker/playerWorker.ts"

function VideoPlayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { workerRef, willWorkerSurvive } = useWorker(WORKER_PATH)
  useOffscreen({ canvasRef, workerRef, willWorkerSurvive })

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const worker = workerRef.current;
    if (!file || !worker) { return; }
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
      <input type="file" accept="video/mp4" onChange={handleFileChange} />
    </div>
  );
}

export default VideoPlayer