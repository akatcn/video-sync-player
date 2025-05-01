import { ResponseCodeEnum } from "@/constants/ResponseCodeEnum";
import { CanvasMessageType, FrameMessageType, ReseponseMessageType, TimestampMessageType, WorkerMessageType } from "@/types/WorkerMessageType";

// TypeScript가 self를 Window로 참조하지 않도록 설정
declare let self: DedicatedWorkerGlobalScope;

let offscreenCanvas: CanvasMessageType["offscreenCanvas"] | null = null;
let videoFrames: FrameMessageType["videoFrames"] = [];
let frameRate: FrameMessageType["frameRate"] | null = null;
let estimatedServerTime: TimestampMessageType["estimatedServerTime"] | null = null;
let mainTimeOrigin: TimestampMessageType["mainTimeOrigin"] | null = null;
let mainReceivedAt: TimestampMessageType["mainReceivedAt"] | null = null;
let requestID: number | null = null

const sendMessage = (code: ResponseCodeEnum | ResponseCodeEnum) => {
  const msg: ReseponseMessageType = { code }
  self.postMessage(msg)
}

const draw = (time: DOMHighResTimeStamp) => {
  // todo: 점검 로직 단순화 및 통합할 것
  if (offscreenCanvas === null) {
    stop()
    sendMessage(ResponseCodeEnum.NO_CANVAS)
    return
  } else if (videoFrames === null || !frameRate) {
    stop()
    sendMessage(ResponseCodeEnum.NO_FRAME_INFO)
    return
  } else if (estimatedServerTime === null || mainTimeOrigin === null || mainReceivedAt === null) {
    stop()
    sendMessage(ResponseCodeEnum.NO_TIMESTAMP_INFO)
    return
  }

  // 프레임 추정
  const mainCurrentTime = time + (performance.timeOrigin - mainTimeOrigin);
  const estimatedCurrentServerTime = estimatedServerTime + (mainCurrentTime - mainReceivedAt);
  const estimatedFrameIndex = Math.floor((estimatedCurrentServerTime / 1_000) * frameRate) % videoFrames.length
  const estimatedVideoFrame = videoFrames[estimatedFrameIndex]

  // todo: draw 사이즈 offscreenCanvas 사이즈에 맞출 것
  offscreenCanvas.width = estimatedVideoFrame.displayWidth;
  offscreenCanvas.height = estimatedVideoFrame.displayHeight
  const ctx = offscreenCanvas.getContext("2d");
  ctx?.drawImage(estimatedVideoFrame, 0, 0);

  requestID = self.requestAnimationFrame(draw)
}

const play = () => {
  // todo: 점검 로직 단순화 및 통합할 것
  if (offscreenCanvas === null) {
    stop()
    sendMessage(ResponseCodeEnum.NO_CANVAS)
    return
  } else if (videoFrames === null || !frameRate) {
    stop()
    sendMessage(ResponseCodeEnum.NO_FRAME_INFO)
    return
  } else if (estimatedServerTime === null || mainTimeOrigin === null || mainReceivedAt === null) {
    stop()
    sendMessage(ResponseCodeEnum.NO_TIMESTAMP_INFO)
    return
  }
  sendMessage(ResponseCodeEnum.VIDEO_PLAY);
  self.requestAnimationFrame(draw)
}

const stop = () => {
  if (requestID === null) { return }
  self.cancelAnimationFrame(requestID)
  sendMessage(ResponseCodeEnum.VIDEO_STOP)
}

const cleanUp = () => {
  // todo: offscreenCanvas에서 전달된 소유권 해제하는 방법 존재하면 소유권 해제 시킬 것
  offscreenCanvas = null;
  videoFrames.forEach(videoFrame => videoFrame.close());
  videoFrames = [];
}

self.onmessage = function (e) {
  console.log("Worker received!:", e.data);
  const msg = e.data as WorkerMessageType;
  switch (msg.type) {
    case "canvas":
      offscreenCanvas = msg.offscreenCanvas;
      sendMessage(ResponseCodeEnum.OFFCANVAS_ACKED);
      break
    case "frame":
      videoFrames.forEach(videoFrame => videoFrame.close());
      videoFrames = msg.videoFrames;
      frameRate = msg.frameRate;
      sendMessage(ResponseCodeEnum.FRAME_INFO_ACKED);
      break
    case "timestamp":
      estimatedServerTime = msg.estimatedServerTime;
      mainTimeOrigin = msg.mainTimeOrigin;
      mainReceivedAt = msg.mainReceivedAt;
      sendMessage(ResponseCodeEnum.TIMESTAMP_ACKED);
      break
    case "command": {
      switch (msg.command) {
        case "play":
          play();
          break
        case "stop":
          stop();
          break
        case "clear":
          cleanUp()
          break
      }
    }
    break
  }
};
