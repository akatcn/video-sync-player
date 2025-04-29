import MP4Box, { DataStream, MP4ArrayBuffer, MP4File, MP4VideoTrack } from "mp4box"

const getDescription = (track: MP4VideoTrack, mp4boxFile: MP4File) => {
  const trak = mp4boxFile.getTrackById(track.id);
  if (trak?.mdia?.minf?.stbl?.stsd?.entries === undefined) {
    throw new Error("entries 찾을 수 없음")
  }
  for (const entry of trak.mdia.minf.stbl.stsd.entries) {
    const box = entry.avcC ?? entry.hvcC;
    if (box) {
      const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
      box.write(stream);
      return new Uint8Array(stream.buffer, 8);  // box 헤더 제거
    }
  }
  throw new Error("avcC 또는 hvcC box 찾을 수 없음");
}

export const getVideoFrameInfo = async (file: File) => {
  const mp4boxFile = MP4Box.createFile()
  const videoFrames: VideoFrame[] = []
  let frameRate = 0;
  const decoder = new VideoDecoder({
    output(frame) {
      videoFrames.push(frame)
    },
    error(e) {
      console.error(e)
    }
  });

  mp4boxFile.onReady = (info) => {
    const videoTrack = info.tracks.find((track) => track.type === "video") as MP4VideoTrack;
    if (!videoTrack) {
      console.error("video 트랙 찾을 수 없음");
      throw new Error("video 트랙 찾을 수 없음")
    }
    const { nb_samples, timescale, duration } = videoTrack
    frameRate = (nb_samples * timescale) / duration;
    const config = {
      codec: videoTrack.codec.startsWith('vp08') ? 'vp8' : videoTrack.codec,
      codedHeight: videoTrack.video.height,
      codedWidth: videoTrack.video.width,
      description: getDescription(videoTrack, mp4boxFile),
    };

    decoder.configure(config);
    mp4boxFile.setExtractionOptions(videoTrack.id, null, { nbSamples: Infinity });
    mp4boxFile.start();
  }

  mp4boxFile.onSamples = (id, ref, samples) => {
    for (const sample of samples) {
      const chunk = new EncodedVideoChunk({
        type: sample.is_sync ? "key" : "delta",
        timestamp: 1e6 * sample.cts / sample.timescale,
        duration: 1e6 * sample.duration / sample.timescale,
        data: sample.data
      });
      decoder.decode(chunk)
    }
  }
  
  const buffer = await file.arrayBuffer();
  const mp4ArrayBuffer = buffer as MP4ArrayBuffer;
  mp4ArrayBuffer.fileStart = 0;
  mp4boxFile.appendBuffer(mp4ArrayBuffer);

  await decoder.flush();
  decoder.close();
  mp4boxFile.flush();
  
  return { videoFrames, frameRate }
}