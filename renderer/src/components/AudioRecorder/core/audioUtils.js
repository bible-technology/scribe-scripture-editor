/* eslint-disable no-await-in-loop */
import { fetchFile } from '@ffmpeg/util';
import * as logger from '../../../logger';

function sec_to_min_sec_milli_convertor(time) {
    try {
        logger.debug('audioUtils.js', 'In  time conversion function');
        let milliseconds = time.toString().split('.')[1];
        if (milliseconds === undefined) {
            milliseconds = '0';
        }
        const minutes = Math.floor(time / 60);
        const seconds = (time - minutes * 60).toString().split('.')[0].padStart(2, 0);
        const formatedStringTime = `${minutes.toString().padStart(2, 0)}:${seconds}:${milliseconds.padStart(2, 0)}`;
        logger.debug('audioUtils.js', 'In  time conversion function done');
        return [minutes, seconds, milliseconds, formatedStringTime];
    } catch (err) {
        throw new Error(`audio generation failed : ${err}`);
    }
}

async function generateTimeStampData(buffers, book, chapter) {
    try {
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
        }).catch((err) => {
            throw new Error(`audio generation failed : ${err}`);
        });
    } catch (err) {
        throw new Error('audio generation failed : err');
    }
}

function sortingLogic(a, b) {
    // expected format : '1_10_1_default.mp3',
    return a.split('_')[1] - b.split('_')[1];
}

export async function mergeAudio(audioArr, dirPath, path, book, chapter, extension, ffmpeg) {
    try {
        logger.debug('audioUtils.js', 'In Merge Audio fucntion');
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve) => {
            audioArr.sort(sortingLogic);
            for (let i = 0; i < audioArr.length; i++) {
                audioArr[i] = path.join(dirPath, audioArr[i]);
            }
            logger.debug('audioUtils.js', 'mergeAudio : start merging audios');

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
            }
            filterStr += `concat=n=${audioArr.length}:v=0:a=1[out]`;
            commandArr.push(...inputCmdArr, '-filter_complex', filterStr, '-map', '[out]', `output.${extension}`);

            logger.debug('audioUtils.js', 'mergeAudio : audio internal write done and buffers created');

            // exeute merge process
            await ffmpeg.exec(commandArr);

            // generate unit8 buffer out
            const fileData = await ffmpeg.readFile(`output.${extension}`);

            logger.debug('audioUtils.js', 'mergeAudio : audio merged buffer created');

            // Create a Blob from the result
            const blob = new Blob([fileData.buffer], { type: extension === 'mp3' ? 'audio/mpeg' : 'audio/wav' });
            logger.debug('audioUtils.js', 'mergeAudio : audio merged blob created');

            if (blob) {
                generateTimeStampData(audioBuffersArr, book, chapter)
                .then((timeStampData) => {
                    logger.debug('audioUtils.js', `mergeAudio : return timestamp for Merged Audio for chapter : ${book} : ${chapter}`);
                    resolve([blob, timeStampData]);
                }).catch((err) => {
                    throw new Error(`unable to generate audio : ${err}`);
                });
            } else {
                throw new Error('unable to generate audio');
            }
        });
    } catch (err) {
        throw new Error(`audio generation failed : ${err}`);
    }
}
