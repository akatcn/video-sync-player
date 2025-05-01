import { ResponseCodeEnum } from "@/constants/ResponseCodeEnum";
import { CanvasMessageType, FrameMessageType, ReseponseMessageType, TimestampMessageType, WorkerMessageType } from "@/types/WorkerMessageType";

let canvas: CanvasMessageType["canvas"] | null = null;
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
  if (canvas === null) {
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

  // todo: draw 사이즈 canvas 사이즈에 맞출 것
  canvas.width = estimatedVideoFrame.displayWidth;
  canvas.height = estimatedVideoFrame.displayHeight
  const ctx = canvas.getContext("2d");
  ctx?.drawImage(estimatedVideoFrame, 0, 0);

  requestID = self.requestAnimationFrame(draw)
}

const play = () => {
  // todo: 점검 로직 단순화 및 통합할 것
  if (canvas === null) {
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

self.onmessage = function (e) {
  console.log("Worker received!:", e.data);
  const msg = e.data as WorkerMessageType;
  switch (msg.type) {
    case "canvas":
      canvas = msg.canvas;
      sendMessage(ResponseCodeEnum.OFFCANVAS_ACKED);
      break
    case "frame":
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
      }
    }
  }
};
