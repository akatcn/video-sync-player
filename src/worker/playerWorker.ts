import { CanvasMessageType, FrameMessageType, TimestampMessageType, WorkerMessageType } from "@/types/WorkerMessageType";

let canvas: CanvasMessageType["canvas"] | null = null;
let videoFrames: FrameMessageType["videoFrames"] = [];
let frameRate: FrameMessageType["frameRate"] | null = null;
let timestamp: TimestampMessageType["timestamp"] | null = null;

const play = () => {
  if (canvas === null || videoFrames === null || frameRate === null || timestamp === null) {
    console.error("영상 재생 불가")
    return
  }
  // 프레임 인덱스 추정
  // painting
  // self.requestAnimationFrame(play)
}

const stop = () => {
  // self.cancelAnimationFrame(requestID)
}

self.onmessage = function (e) {
  console.log("Worker received!:", e.data);
  const msg = e.data as WorkerMessageType;
  switch (msg.type) {
    case "canvas":
      canvas = msg.canvas;
      break
    case "frame":
      videoFrames = msg.videoFrames;
      frameRate = msg.frameRate;
      break
    case "timestamp":
      timestamp = msg.timestamp
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
