import { ResponseCodeEnum } from "@/constants/ResponseCodeEnum";
import { CanvasMessageType, FrameMessageType, ReseponseMessageType, TimestampMessageType, WorkerMessageType } from "@/types/WorkerMessageType";

let canvas: CanvasMessageType["canvas"] | null = null;
let videoFrames: FrameMessageType["videoFrames"] = [];
let frameRate: FrameMessageType["frameRate"] | null = null;
let timestamp: TimestampMessageType["timestamp"] | null = null;
let requestID: number | null = null

const sendMessage = (code: ResponseCodeEnum | ResponseCodeEnum) => {
  const msg: ReseponseMessageType = { code }
  self.postMessage(msg)
}

const drawing = () => {
  // 프레임 인덱스 추정
  // offcanvas drawing
  requestID = self.requestAnimationFrame(drawing)
}

const play = () => {
  if (canvas === null) {
    stop()
    sendMessage(ResponseCodeEnum.NO_CANVAS)
    return
  } else if (videoFrames === null || !frameRate) {
    stop()
    sendMessage(ResponseCodeEnum.NO_FRAME_INFO)
    return
  } else if (timestamp === null) {
    stop()
    sendMessage(ResponseCodeEnum.NO_TIMESTAMP)
    return
  }
  sendMessage(ResponseCodeEnum.VIDEO_PLAY);
  drawing()
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
      timestamp = msg.timestamp;
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
