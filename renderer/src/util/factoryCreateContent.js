import { createVersificationUSFM } from './createVersificationUSFM';
import { createAudioVersification } from './createAudioVersification';
import { createObsContent } from './createObsContent';
import * as logger from '../logger';

// const projectTypes = ['Translation', 'Audio', 'OBS', 'Juxta'];

export const factoryCreateContent = ({
  username,
  project,
  versification,
  books,
  direction,
  id,
  importedFiles,
  copyright,
  currentBurrito,
  call,
  projectType,
}) => {
  let promise;
  switch (projectType) {
    case 'Translation':
      promise = createVersificationUSFM(
        username,
        project,
        versification,
        books,
        direction,
        id,
        importedFiles,
        copyright,
        currentBurrito,
        call,
        projectType,
      );
      break;
    case 'Audio':
      promise = createAudioVersification(
        username,
        project,
        versification,
        id,
        copyright,
        currentBurrito,
        call,
      );
      break;
    case 'OBS':
      promise = createObsContent(
        username,
        project,
        direction,
        id,
        currentBurrito,
        importedFiles,
        copyright,
        call,
      );
      break;
    default:
      logger.error('factoryCreateContent.js', `projectType doesn't exist : ${projectType}`);

    return promise;
  }
};
