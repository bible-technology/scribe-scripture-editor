import path from 'path';
import type fsType from 'fs';

export function detectObsCombinedAudio(
  importPath: string,
  fs: typeof fsType
): boolean {

  const timeStampDir = path.join(importPath, 'time stamps');
  if (fs.existsSync(timeStampDir)) {
    return true;
  }

  const audioBasePath = path.join(importPath, 'ingredients', 'audio');
  if (!fs.existsSync(audioBasePath)) {
    return false;
  }

  const storyDirs = fs
    .readdirSync(audioBasePath, { withFileTypes: true })
    .filter((d: fsType.Dirent) => d.isDirectory())
    .map((d: fsType.Dirent) => d.name);

  if (storyDirs.length === 0) {
    return false;
  }

  for (const story of storyDirs) {
    const storyPath = path.join(audioBasePath, story);
    const files = fs.readdirSync(storyPath);

    const combinedAudioFiles = files.filter((f: string) =>
      /^\d+\.(mp3|wav)$/i.test(f)
    );

    if (combinedAudioFiles.length !== 1) {
      return false;
    }
  }

  return true;
}
