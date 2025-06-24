import { ResponseCodeEnum } from "@/constants/ResponseCodeEnum";

export type CanvasMessage = {
  type: "canvas";
  offscreenCanvas: OffscreenCanvas;
};

export type FrameMessage = {
  type: "frame";
  videoFrames: VideoFrame[];
  frameRate: number;
};

export type TimestampMessage = {
  type: "timestamp";
  estimatedServerTime: number;
  mainTimeOrigin: number;
  mainReceivedAt: number;
};

export type CommandMessage = {
  type: "command";
  command: "play" | "stop" | "clear" | "close";
};

export type WorkerMessage =
  | CanvasMessage
  | FrameMessage
  | TimestampMessage
  | CommandMessage;

export type ReseponseMessage = {
  code: ResponseCodeEnum | ResponseCodeEnum;
};
