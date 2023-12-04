/* eslint-disable no-await-in-loop */
import { fetchFile } from '@ffmpeg/util';
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
    console.log({ buffers, book, chapter });
    logger.debug('audioUtils.js', 'In TimeStamp Generation');
    return new Promise((resolve) => {
        let fileString = 'verse_number\tstart_timestamp\tduration\n';
        const seperator = '\t';
        const fileType = 'tsv';
        const file = `${book}_${chapter.toString().padStart(3, 0)}.${fileType}`;
        let start = 0;
        buffers.forEach((buffer, index) => {
            console.log({ buffer, index });
            const currentVerse = `Verse_${(index + 1).toString().padStart(2, 0)}`;
            console.log({ currentVerse });
            const startTimeString = sec_to_min_sec_milli_convertor(start)[3];
            console.log({ startTimeString }, buffer.duration);
            const durationString = sec_to_min_sec_milli_convertor(buffer.duration)[3];
            console.log({ durationString });
            fileString += `${currentVerse + seperator + startTimeString + seperator + durationString}\n`;
            console.log({ fileString }, buffer.duration);
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

export async function mergeAudio(audioArr, dirPath, path, book, chapter, extension, ffmpeg) {
    logger.debug('audioUtils.js', 'In Merge Audio fucntion');
    // const audio = new ConcatAudio(window);
    return new Promise(async (resolve, reject) => {
        audioArr.sort(sortingLogic);
        for (let i = 0; i < audioArr.length; i++) {
            audioArr[i] = path.join(dirPath, audioArr[i]);
        }
        logger.debug('audioUtils.js', 'start merging audios');

        console.log({ audioArr });

        // --------------------------------------------------------------------------------------------

        // const inputFiles = [];
        // const inputFilesNames = [];

        // for (let i = 0; i < audioArr.length; i++) {
        //     // const response = await fetch(path.join('file://', audioArr[i]));
        //     // const arrayBuffer = await response.arrayBuffer();
        //     // audioBuffers.push(arrayBuffer);

        //     // await fetchFile(path.join('file://', audioArr[i]));
        //     // const file = new File([arrayBuffer], `input_${i}.wav`);
        //     inputFilesNames.push(`input_${i}.wav`);
        //     // inputFiles.push(file);
        // }

        // console.log('finished write file');
        // await ffmpeg.exec(['-i', `concat:${inputFiles.map((_, index) => `input_${index}.wav`).join('|')}`, 'output.mp3']);
        // console.log('finished concat exec -------');

        // // Get the result
        // try {
        //     const data = await ffmpeg.readFile('output.mp3');
        //     console.log('data ==========> ', data);
        // } catch (err) {
        //     console.log('error reading  ==========> ', err);
        // }

        try {
        // write with file and read method
        // await ffmpeg.writeFile('concat_list.txt', inputFilesNames.join('/n'));
        // const listData = await ffmpeg.readFile('concat_list.txt');

        // await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', await ffmpeg.readFile('concat_list.txt'), 'output.mp3']);

        // geneate the sequence command string ['-i', 'input1.wav', '-i', 'input2.wav', .... , '-filter_complex',
        // '[0:0][1:0][2:0][3:0]concat=n=4:v=0:a=1[out]']

        //         ffmpeg -i input1.wav -i input2.wav -i input3.wav -i input4.wav \
        // -filter_complex '[0:0][1:0][2:0][3:0]concat=n=4:v=0:a=1[out]' \
        // -map '[out]' output.wav

        console.log('starting merge ----------- ', { ffmpeg });

        const inputCmdArr = [];
        const commandArr = [];
        const audioBuffersArr = [];
        let filterStr = '';

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        for (let i = 0; i < audioArr.length; i++) {
            const audioFile = await fetchFile(path.join('file://', audioArr[i]));
            const audioFileCopy = new Uint8Array(audioFile);
            await ffmpeg.writeFile(`input_${i}.wav`, audioFile);
            inputCmdArr.push('-i', `input_${i}.wav`);
            filterStr += `[${i}:0]`;

            const audioBuffer = await audioContext.decodeAudioData(audioFileCopy.buffer);
            audioBuffersArr.push(audioBuffer);
            console.log({ audioBuffer }, typeof audioBuffer);

            // await ffmpeg.writeFile(`input_${i}.wav`, new Uint8Array(inputFiles[i].arrayBuffer()));
        }

        filterStr += `concat=n=${audioArr.length}:v=0:a=1[out]`;

        commandArr.push(...inputCmdArr, '-filter_complex', filterStr, '-map', '[out]', `output.${extension}`);

        console.log({ commandArr });

        await ffmpeg.exec(commandArr);

        // const data = await ffmpeg.readFile('output.mp3');
        const fileData = await ffmpeg.readFile(`output.${extension}`);

        console.log({ fileData });

        // Create a Blob from the result
        const blob = new Blob([fileData.buffer], { type: extension === 'mp3' ? 'audio/mp3' : 'audio/wav' });

        console.log('genetated blob : ', { blob });

        if (blob) {
            generateTimeStampData(audioBuffersArr, book, chapter)
            .then((timeStampData) => {
                logger.debug('audioUtils.js', `return Merged Audio for chapter : ${book} : ${chapter}`);
                resolve([blob, timeStampData]);
            }).catch((err) => {
                throw new Error(`unable to generate audio : ${err}`);
            });
        } else {
            throw new Error('unable to generate audio');
        }

        // resolve(blob, []);
        } catch (err) {
            console.log('errrorrrr ========> ', err);
            reject(err);
        }

        // Promise.all(
        //     audioArr.map(async (url) => {
        //       const response = await fetch(path.join('file://', url));
        //       const arrayBuffer = await response.arrayBuffer();
        //       return new File([arrayBuffer], 'audio.wav', { type: 'audio/wav' });
        //     }),
        //   ).then(async (files) => {
        //     await files.forEach((file, index) => {
        //         ffmpeg.FS('writeFile', `input_${index}.wav`, new Uint8Array(file.arrayBuffer()));
        //     });

        //     await ffmpeg.run('-i', `concat:${files.map((_, index) => `input_${index}.wav`).join('|')}`, 'output.mp3');

        //     // Get the result
        //     const data = ffmpeg.FS('readFile', 'output.mp3');

        //     // Create a Blob from the result
        //     const blob = new Blob([data.buffer], { type: 'audio/mp3' });

        //     console.log('generated blob : ', { blob });
        //     return blob;
        // }).then((blob) => {
        //       console.log('in resolve : ', blob);
        //       resolve(blob, []);
        //   }).catch((err) => {
        //     console.log('error in conversion and merge : ', err);
        //     reject(err);
        //   });

        // --------------------------------------------------------------------------------------------

        // fetchAndCombineAudio(audioArr, path)
        // .then(async (mergedData) => {
        //     logger.debug('audioUtils.js', `Audio merge success . Started Generate Timestamp : ${book} : ${chapter}`);
        //     generateTimeStampData(mergedData.buffers, book, chapter)
        //     .then((timeStampData) => {
        //         logger.debug('audioUtils.js', `return Merged Audio for chapter : ${book} : ${chapter}`);
        //         resolve([mergedData.blob, timeStampData]);
        //     });
        // });
    });
}
//

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
