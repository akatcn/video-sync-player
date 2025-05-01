import { ResponseCodeEnum } from "@/constants/ResponseCodeEnum";

export type CanvasMessageType = {
  type: "canvas";
  canvas: OffscreenCanvas;
}

export type FrameMessageType = {
  type: "frame";
  videoFrames: VideoFrame[];
  frameRate: number;
}

export type TimestampMessageType = {
  type: "timestamp";
  timestamp: number;
}

export type CommandMessageType = {
  type: "command";
  command: "play" | "stop";
}

export type WorkerMessageType = CanvasMessageType | FrameMessageType | TimestampMessageType | CommandMessageType

export type ReseponseMessageType = {
  code: ResponseCodeEnum | ResponseCodeEnum;
}