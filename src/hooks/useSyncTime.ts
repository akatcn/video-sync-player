import { WorkerMessageType } from "@/types/WorkerMessageType";
import { RefObject, useEffect } from "react";

type UseSyncTimeProps = {
  workerRef: RefObject<Worker | null>;
  isWorkerReady: boolean;
}

const BASE_INTERVAL_TIME = 60_000 * 3;  // 3분
const OFFSET_MIN = 3_000;
const OFFSET_MAX = 15_000;

const useSyncTime = ({ workerRef, isWorkerReady }: UseSyncTimeProps) => {
  const getServerTime = async () => {
    /* ---------- todo: 로직 변경할 것 ----------- */
    // 1. /time 요청을 N번 보낸다
    // 2. N개 이하의 성공한 응답중 rtt 값이 가장 작은 응답을 채택한다
    // 3. 해당 응답의 tServer, rtt, receivedAt을 사용한다
    const requestAt = performance.now()
    const response = await fetch(`http://localhost:3000/time`);  // todo: 에러 핸들링
    const { timeStamp: tServer } = await response.json()  // todo: response 타입 정의
    const receivedAt = performance.now()
    const rtt = receivedAt - requestAt
    /* ---------------------------------------- */

    const estimatedServerTime = tServer + (rtt / 2)  // todo: 더 정교한 추정이 되도록 할 것

    return {
      estimatedServerTime,
      timeOrigin: performance.timeOrigin,
      receivedAt
    }
  }

  useEffect(() => {
    const fetchTime = async () => {
      const worker = workerRef.current;
      if (!worker || !isWorkerReady) { return }
      const { estimatedServerTime, timeOrigin, receivedAt } = await getServerTime()
      const msg: WorkerMessageType = {
        type: "timestamp",
        estimatedServerTime,
        mainTimeOrigin: timeOrigin,
        mainReceivedAt: receivedAt
      }
      worker.postMessage(msg)
    }
    fetchTime()

    const randomOffset = Math.floor(Math.random() * (OFFSET_MAX - OFFSET_MIN + 1)) + OFFSET_MIN;
    const timerId = setInterval(() => {
      fetchTime()
    }, BASE_INTERVAL_TIME + randomOffset)

    return () => {
      clearInterval(timerId)
    }
  }, [workerRef, isWorkerReady])
}

export default useSyncTime