import { CanvasMessageType } from "@/types/WorkerMessageType";
import { RefObject, useEffect, useRef } from "react";

type UseOffscreenProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  workerRef: RefObject<Worker | null>;
  willWorkerSurvive: boolean;
}

// offscreen을 사용하면 워커에게 offscreen을 보내는 행위를 항상 수행하므로, 이 둘을 하나의 custom Hook에 묶었다
const useOffscreen = ({ canvasRef, workerRef, willWorkerSurvive }: UseOffscreenProps) => {
  const offscreenRef = useRef<OffscreenCanvas>(null);

  useEffect(() => {
    // transferControlToOffscreen()은 한 번만 실행되어야 함
    if (!offscreenRef.current) {
      const offscreen = canvasRef.current?.transferControlToOffscreen() ?? null
      offscreenRef.current = offscreen
    }
  }, [canvasRef])

  useEffect(() => {
    const worker = workerRef.current;
    const offscreen = offscreenRef.current;
    if (worker && offscreen && willWorkerSurvive) {
      // OffscreenCanvas는 postMessage로 워커에 전달하면 "소유권"이 넘어가므로 한 번만 postMessage할 수 있다
      // 워커가 앞으로 계속해서 생존할 수 있을 때만 소유권을 넘긴다
      const msg: CanvasMessageType = { type: "canvas", canvas: offscreen };
      worker.postMessage(msg, [offscreen])
    }
  }, [workerRef, willWorkerSurvive])
}

export default useOffscreen