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
    const worker = new Worker(new URL(path, import.meta.url), { type: 'module' });
    // strict mode에선 clear function에 의해 워커가 곧바로 terminate되므로 setTimeout을 통해 워커 상태 업데이트를 '예약'한다
    const workerReadyTimerId = setTimeout(() => {
      workerRef.current = worker;
      setIsWorkerReady(true);
    }, 0)

    return () => {
      const msg: WorkerMessageType = {
        type: "command",
        command: "clear"
      }
      worker.postMessage(msg)
      worker.terminate()  // todo: 워커의 cleanUp 로직이 전부 실행된 뒤에 terminate될 수 있도록 보장해야한다
      workerRef.current = null
      clearTimeout(workerReadyTimerId)
    };
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