/* eslint-disable no-await-in-loop */
import * as logger from '../../../logger';

const toWav = require('audiobuffer-to-wav');

function sec_to_min_sec_milli_convertor(time) {
  logger.debug('audioUtils.js', 'In  time conversion function');
  let milliseconds = time.toString().split('.')[1];
  if (milliseconds === undefined) {
    milliseconds = '0';
  }
  const minutes = Math.floor(time / 60);
  const seconds = (time - minutes * 60).toString().split('.')[0].padStart(2, 0);
  const formatedStringTime = `${minutes.toString().padStart(2, 0)}:${seconds}:${milliseconds.padStart(2, 0)}`;
  return [minutes, seconds, milliseconds, formatedStringTime];
}

async function generateTimeStampData(buffers, book, chapter) {
  logger.debug('audioUtils.js', 'In TimeStamp Generation');
  return new Promise((resolve) => {
    let fileString = 'verse_number\tstart_timestamp\tduration\n';
    const seperator = '\t';
    const fileType = 'tsv';
    const file = `${book}_${chapter.toString().padStart(3, 0)}.${fileType}`;
    let start = 0;
    buffers.forEach((buffer, index) => {
      const currentVerse = `Verse_${(index + 1).toString().padStart(2, 0)}`;
      const startTimeString = sec_to_min_sec_milli_convertor(start)[3];
      const durationString = sec_to_min_sec_milli_convertor(buffer.duration)[3];
      fileString += `${currentVerse + seperator + startTimeString + seperator + durationString}\n`;
      start += buffer.duration;
    });
    resolve([file, fileString]);
  });
}

async function fetchAndCombineAudio(audioArr, path) {
  logger.debug('audioUtils.js', 'In Fetch and merge audio function');
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    const context = new window.AudioContext();

    // store the decoded buff
    const sources = [];

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const url of audioArr) {
      try {
        const response = await fetch(path.join('file://', url));
        const buffer = await response.arrayBuffer();
        const decodedData = await context.decodeAudioData(buffer);
        sources.push(decodedData);
      } catch (err) {
        logger.error('audioUtils.js', `Error reading audio - ${url} : ${err}`);
      }
    }

    logger.debug('audioUtils.js', 'In fetchAndCombineAudio : Fetch audio success  ');

    const totalLength = sources.reduce((total, source) => total + source.length, 0);
    const output = context.createBuffer(1, totalLength, context.sampleRate);

    let offset = 0;

    // eslint-disable-next-line no-restricted-syntax
    for (const source of sources) {
      output.copyToChannel(source.getChannelData(0), 0, offset);
      offset += source.length;
    }
    const wavData = toWav(output);
    logger.debug('audioUtils.js', 'In fetchAndCombineAudio : generate wav success');
    const blob = new Blob([new DataView(wavData)], { type: 'audio/wav' });
    logger.debug('audioUtils.js', 'In fetchAndCombineAudio : Generate Final merged Audio success ');
    resolve({ blob, buffers: sources });
  });
}

function sortingLogic(a, b) {
  // expected format : '1_10_1_default.mp3',
  return a.split('_')[1] - b.split('_')[1];
}

export async function mergeAudio(audioArr, dirPath, path, book, chapter) {
  logger.debug('audioUtils.js', 'In Merge Audio fucntion');
  // const audio = new ConcatAudio(window);
  return new Promise((resolve) => {
    audioArr.sort(sortingLogic);
    for (let i = 0; i < audioArr.length; i++) {
      audioArr[i] = path.join(dirPath, audioArr[i]);
    }
    logger.debug('audioUtils.js', 'start merging audios');

    fetchAndCombineAudio(audioArr, path)
      .then(async (mergedData) => {
        logger.debug('audioUtils.js', `Audio merge success . Started Generate Timestamp : ${book} : ${chapter}`);
        generateTimeStampData(mergedData.buffers, book, chapter)
          .then((timeStampData) => {
            logger.debug('audioUtils.js', `return Merged Audio for chapter : ${book} : ${chapter}`);
            resolve([mergedData.blob, timeStampData]);
          });
      });
  });
}

// old snippet for reference

// export async function mergeAudio(audioArr, dirPath, path, book, chapter) {
//     logger.debug('audioUtils.js', 'In Merge Audio fucntion');
//     const audio = new ConcatAudio(window);
//     return new Promise((resolve) => {
//         let merged;
//         let output;
//         audioArr.sort();
//         for (let i = 0; i < audioArr.length; i++) {
//             audioArr[i] = path.join(dirPath, audioArr[i]);
//         }
//         logger.debug('audioUtils.js', 'start merging audios');
//         audio.fetchAudio(...audioArr)
//         .then(async (buffers) => {
//             // generate timestamp data string
//             await generateTimeStampData(buffers, book, chapter)
//             .then((timeStampData) => {
//                 // merging all buffers
//                 merged = audio.concatAudio(buffers);
//                 return [merged, timeStampData];
//             })
//             .then(async ([merged, timeStampData]) => {
//                 output = audio.export(merged, 'audio/mp3');
//                 logger.debug('audioUtils.js', `return Merged Audio for chapter : ${book} : ${chapter}`);
//                 resolve([output.blob, timeStampData]);
//             });
//         });
//     });
// }
