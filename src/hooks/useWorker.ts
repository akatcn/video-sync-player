import { WorkerMessageType } from "@/types/WorkerMessageType";
import { useEffect, useRef, useState } from "react"

type UseWorkerProps = {
  path: string;
  onmessage: (e: MessageEvent) => void
}

const useWorker = ({ path, onmessage }: UseWorkerProps) => {
  const workerRef = useRef<Worker | null>(null);
  const [willWorkerSurvive, setWillWorkerSurvive] = useState(false);  // 워커가 계속해서 살아있을 수 있는지를 나타내는 state

  useEffect(() => {
    const worker = new Worker(new URL(path, import.meta.url), { type: 'module' });
    // strict mode에선 clear function에 의해 워커가 곧바로 terminate되므로 setTimeout을 통해 업데이트를 '예약'한다
    const timerId = setTimeout(() => {
      workerRef.current = worker;
      setWillWorkerSurvive(true);
    }, 0)

    return () => {
      const msg: WorkerMessageType = {
        type: "command",
        command: "clear"
      }
      worker.postMessage(msg)
      worker.terminate()
      clearTimeout(timerId)
    };
  }, [path])

  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.onmessage = onmessage
    }
  }, [onmessage])

  return {
    workerRef,
    willWorkerSurvive
  }
}

export default useWorker