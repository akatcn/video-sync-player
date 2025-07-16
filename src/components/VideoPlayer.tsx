import { Ref } from "react";

type VideoPlayerProps = {
  canvasRef: Ref<HTMLCanvasElement>;
  isVideoFramesAcked: boolean;
};

function VideoPlayer({ canvasRef, isVideoFramesAcked }: VideoPlayerProps) {
  return (
    <div className="relative flex w-full">
      {!isVideoFramesAcked && (
        <p className="absolute text-center font-semibold top-1/2 left-1/2 text-2xl -translate-x-1/2 -translate-y-1/2">
          동영상 파일을 업로드 해주세요
        </p>
      )}
      <canvas ref={canvasRef} className="bg-black w-full h-full rounded-2xl" />
    </div>
  );
}

export default VideoPlayer;
