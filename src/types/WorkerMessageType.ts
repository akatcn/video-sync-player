import { ResponseCodeEnum } from "@/constants/ResponseCodeEnum";

export type CanvasMessageType = {
  type: "canvas";
  offscreenCanvas: OffscreenCanvas;
}

export type FrameMessageType = {
  type: "frame";
  videoFrames: VideoFrame[];
  frameRate: number;
}

export type TimestampMessageType = {
  type: "timestamp";
  estimatedServerTime: number;
  mainTimeOrigin: number;
  mainReceivedAt: number
}

export type CommandMessageType = {
  type: "command";
  command: "play" | "stop" | "clear" | "close";
}

export type WorkerMessageType = CanvasMessageType | FrameMessageType | TimestampMessageType | CommandMessageType

export type ReseponseMessageType = {
  code: ResponseCodeEnum | ResponseCodeEnum;
}