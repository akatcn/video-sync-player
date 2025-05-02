import { WorkerMessageType } from "@/types/WorkerMessageType";
import { useEffect, useRef, useState } from "react"

type UseWorkerProps = {
  path: string;
  onmessage: (e: MessageEvent) => void;
}

const useWorker = ({ path, onmessage }: UseWorkerProps) => {
  const workerRef = useRef<Worker | null>(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);

  useEffect(() => {
    const worker = new Worker(new URL(path, import.meta.url), { type: 'module' })
    // 워커 세팅 예약
    const workerReadyTimerId = setTimeout(() => {
      setIsWorkerReady(true)
      workerRef.current = worker
    }, 0)

    return () => {
      const msg: WorkerMessageType = {
        type: "command",
        command: "close"
      }
      worker.postMessage(msg)
      workerRef.current = null
      clearTimeout(workerReadyTimerId)  // 워커 세팅 예약 취소
    }
  }, [path])

  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.onmessage = onmessage
    }
  }, [onmessage])

  return {
    workerRef,
    isWorkerReady
  }
}

export default useWorker