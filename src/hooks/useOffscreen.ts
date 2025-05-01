import { CanvasMessageType } from "@/types/WorkerMessageType";
import { RefObject, useEffect, useRef } from "react";

type UseOffscreenProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  workerRef: RefObject<Worker | null>;
  willWorkerSurvive: boolean
}

// offscreen을 사용하면 워커에게 offscreen을 보내는 행위를 항상 수행하므로, 이 둘을 하나의 custom Hook에 묶었다
const useOffscreen = ({ canvasRef, workerRef, willWorkerSurvive }: UseOffscreenProps) => {
  const offscreenRef = useRef<OffscreenCanvas>(null);
  const isTransferredRef = useRef(false);

  useEffect(() => {
    const offscreen = offscreenRef.current;
    const canvas = canvasRef.current;
    // canvas 엘리먼트는 한 번만 offscreen으로 전달될 수 있다
    // 이미 offscreen으로 전달된 상태에서 transferControlToOffscreen()을 실행하면 InvalidStateError가 발생한다
    // 그러므로 offscreen이 세팅되지 않은 경우(!offscreenRef.current)에만 transferControlToOffscreen 한다
    if (!offscreen && willWorkerSurvive && canvas) {
      const offscreen = canvas.transferControlToOffscreen()
      offscreenRef.current = offscreen
    }
  }, [canvasRef, willWorkerSurvive])

  useEffect(() => {
    const worker = workerRef.current;
    const offscreen = offscreenRef.current;
    const isTransferred = isTransferredRef.current;
    // OffscreenCanvas를 postMessage로 워커에 전달하면 "소유권"도 전달되므로 한 번만 postMessage할 수 있다
    // 그러므로 소유권이 전달되지 않은 경우(!Transferred)에만 offscreen을 postMessage한다
    if (!isTransferred && willWorkerSurvive && worker && offscreen) {
      const msg: CanvasMessageType = { type: "canvas", offscreenCanvas: offscreen };
      worker.postMessage(msg, [offscreen])
      isTransferredRef.current = true
    }
  }, [workerRef, willWorkerSurvive])
}

export default useOffscreen