// ffmpeg audio core related fucntionalities
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

let ffmpeg;

export default async function loadFFmpeg() {
  ffmpeg = new FFmpeg();
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  return ffmpeg;
}

export const transcodeSingleWavToMp3 = async (inputFilePath, project, book, chapter, packageInfo, currentUser) => {
  await ffmpeg.writeFile('input.wav', await fetchFile(inputFilePath));
  // await ffmpeg.exec(['-i', 'input.wav', '-b:a', '96', '-ar', '44100', '-c:a', 'copy', 'output.mp3']);
  let audioMetaDataArr = [];
  if (project?.name && book && chapter && packageInfo && currentUser) {
    audioMetaDataArr = [
      '-metadata', `title=${book}_${chapter}`,
      '-metadata', `artist=${currentUser || packageInfo.name}`,
      '-metadata', `album=${project.name}`,
      '-metadata', `comment=${packageInfo.name}_${packageInfo.version}`,
      '-metadata', `date=${new Date().getFullYear().toString()}`,
  ];
  }
  await ffmpeg.exec(['-i', 'input.wav', ...audioMetaDataArr, 'output.mp3']);
  const fileData = await ffmpeg.readFile('output.mp3');
  const data = new Uint8Array(fileData);
  const mp3Blob = new Blob([data.buffer], { type: 'audio/mpeg' });
  return mp3Blob;
};
