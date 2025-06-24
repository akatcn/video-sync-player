import { Button } from "@components/ui/button";
import { Switch } from "@components/ui/switch";
import { FastForward, Play, Rewind, RotateCw, Upload } from "lucide-react";

function VideoControlPanel() {
  return (
    <section className="flex flex-col justify-between ">
      <div>
        <div className="flex flex-col items-end gap-y-1">
          <div className="flex items-center gap-x-2">
            <span>AutoSync</span>
            <Switch />
          </div>
          <p className="text-xs text-disabled">
            3~15분 간격으로 싱크를 자동으로 맞춥니다
          </p>
        </div>
        <div className="whitespace-nowrap text-muted-foreground space-y-6 text-sm mt-6">
          <p>50MB 이하의 영상 파일만 업로드할 수 있습니다</p>
          <p>업로드 가능한 확장자: mp4, m4a, m4v, mov</p>
          <p>Sync 모드 사용을 위해 네트워크 연결이 요구됩니다</p>
        </div>
      </div>
      <div className="flex flex-col gap-y-4">
        <Button size="xl">
          <Upload />
        </Button>
        <Button size="xl">
          <Play />
        </Button>
        <div className="flex gap-x-4">
          <Button className="flex-1" size="xl">
            <Rewind />
          </Button>
          <Button className="flex-1" size="xl">
            <RotateCw />
          </Button>
          <Button className="flex-1" size="xl">
            <FastForward />
          </Button>
        </div>
      </div>
    </section>
  );
}

export default VideoControlPanel;
