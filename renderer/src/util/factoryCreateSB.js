import createTranslationSB from '../core/burrito/createTranslationSB';
import createJuxtalinearSB from '../core/burrito/createJuxtalinearSB';
import createAudioSB from '../core/burrito/createAudioSB';
import createVideoSB from '../core/burrito/createVideoSB';
import createObsSB from '../core/burrito/createObsSB';
import * as logger from '../logger';

// const projectTypes = ['Translation', 'Audio', 'Video', 'OBS', 'Juxta'];

export const factoryCreateSB = async ({
  projectTypeToUse,
  username,
  projectFields,
  selectedScope,
  language,
  langCode,
  direction,
  copyright,
  id,
  project,
  call,
  update,
}) => {
  let burritoFilePromise;
  switch (projectTypeToUse) {
  case 'Translation':
    burritoFilePromise = await createTranslationSB(
      username,
      projectFields,
      selectedScope,
      language,
      langCode,
      direction,
      copyright,
      id,
      project,
      call,
      update,
    );
    break;
  case 'Audio':
    burritoFilePromise = await createAudioSB(
      username,
      projectFields,
      selectedScope,
      language,
      langCode,
      direction,
      copyright,
      id,
      project,
      call,
      update,
    );
    break;
  case 'Video':
    burritoFilePromise = await createVideoSB(
      username,
      projectFields,
      selectedScope,
      language,
      langCode,
      direction,
      copyright,
      id,
      project,
      call,
      update,
    );
    break;
  case 'OBS':
    burritoFilePromise = await createObsSB(
      username,
      projectFields,
      language,
      langCode,
      direction,
      copyright,
      id,
      project,
      call,
      update,
    );
    break;
  case 'Juxta':
    burritoFilePromise = await createJuxtalinearSB(
      username,
      projectFields,
      selectedScope,
      language,
      langCode,
      direction,
      copyright,
      id,
      project,
      call,
      update,
    );
    break;
  default:
    logger.error('factoryCreateContent.js', `projectTypeToUse doesn't exist [Translation, Audio, Video, OBS, Juxta]: ${projectTypeToUse}`);
  }
  return burritoFilePromise;
};
