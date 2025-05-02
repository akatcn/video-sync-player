import { CanvasMessageType } from "@/types/WorkerMessageType";
import { RefObject, useEffect, useRef } from "react";

type UseOffscreenProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  workerRef: RefObject<Worker | null>;
  isWorkerReady: boolean;
}

// offscreen을 사용하면 워커에게 offscreen을 보내는 행위를 항상 수행하므로, 이 둘을 하나의 custom Hook에 묶었다
const useOffscreenCanvas = ({ canvasRef, workerRef, isWorkerReady }: UseOffscreenProps) => {
  const prevOffscreenRef = useRef<OffscreenCanvas>(null)

  useEffect(() => {
    const prevOffscreenCanvas = prevOffscreenRef.current
    const worker = workerRef.current
    const canvas = canvasRef.current
    if (prevOffscreenCanvas || !isWorkerReady || !worker || !canvas) { return }

    const offscreenCanvas = canvas.transferControlToOffscreen()
    prevOffscreenRef.current = offscreenCanvas

    const msg: CanvasMessageType = { type: "canvas", offscreenCanvas }
    worker.postMessage(msg, [offscreenCanvas])
  }, [workerRef, canvasRef, isWorkerReady])  // isWorkerReady 추가
}

export default useOffscreenCanvas