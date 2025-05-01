export const PlayStatusEnum = {
  PLAY: "PLAY",
  STOP: "STOP"
} as const

export type PlayStatusEnum = typeof PlayStatusEnum[keyof typeof PlayStatusEnum]