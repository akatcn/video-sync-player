import { useEffect, useRef, useState } from "react"

const useWorker = (path: string, onmessage: (e: MessageEvent) => void) => {
  const workerRef = useRef<Worker | null>(null);
  const [willWorkerSurvive, setWillWorkerSurvive] = useState(false);  // 워커가 계속해서 살아있을 수 있는지를 나타내는 state

  useEffect(() => {
    const worker = new Worker(new URL(path, import.meta.url), { type: 'module' });
    workerRef.current = worker;
    // strict mode에선 clear function에 의해 워커가 곧바로 terminate되므로 setTimeout을 통해 업데이트를 '예약'한다
    const timerId = setTimeout(() => {
      setWillWorkerSurvive(true)
    }, 0)
    worker.onmessage = onmessage

    return () => {
      worker.terminate(); // 컴포넌트가 언마운트되면 워커 종료
      clearTimeout(timerId)
      setWillWorkerSurvive(false)
    };
  }, [path])

  return {
    workerRef,
    willWorkerSurvive
  }
}

export default useWorker