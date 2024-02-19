import { createVersificationUSFM } from './createVersificationUSFM';
import { createAudioVersification } from './createAudioVersification';
import { createObsContent } from './createObsContent';
import { createJuxtaContent } from './createJuxtaContent';
import * as logger from '../logger';

// const projectTypes = ['Translation', 'Audio', 'OBS', 'Juxta'];

/**
 *
 * @param {*} param0
 * @returns {Promise}
 */
export const factoryCreateContent = async ({
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
  projectTypeToUse,
}) => {
  let promise;
  switch (projectTypeToUse) {
    case 'Translation':
      promise = await createVersificationUSFM(
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
      promise = await createAudioVersification(
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
      promise = await createObsContent(
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
    case 'Juxta':
      // Nicolas : Todo createVersificationJuxta ??
      promise = await createJuxtaContent(
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
    default:
      logger.error('factoryCreateContent.js', `projectType doesn't exist : ${projectType}`);
    }
  return promise;
};
