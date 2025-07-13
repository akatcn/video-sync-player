import { Ref } from "react";

type VideoPlayerProps = {
  canvasRef: Ref<HTMLCanvasElement>;
};

function VideoPlayer({ canvasRef }: VideoPlayerProps) {
  return (
    <div className="w-full flex">
      <canvas ref={canvasRef} className="bg-black w-full h-full rounded-2xl" />
    </div>
  );
}

export default VideoPlayer;
