async function readAudioFileAndDecode(filepath, audioContext) {
  // const response = await fetch(path.join('file://', url));
  const response = await fetch(filepath);
  const buffer = await response.arrayBuffer();
  // const decodedData = await audioContext.decodeAudioData(buffer);
  return buffer;
}

const convertToMP3 = async (audioContext, inputPath, outpath) => {

};

// lame js testing
// const convertToMP3 = async (audioContext, filePath) => {
//   try {
//   // read file
//   const audioBuffer = await readAudioFileAndDecode(filePath, audioContext);
//   const encoder = new Mp3Encoder(1, 44100, 128); // Mono, 44.1 kHz, 128 kbps

//   const wavView = new DataView(audioBuffer);

//   const mp3Buffer = [];
//   const sampleBlockSize = 1152;
//   const samplesMono = new Int16Array(sampleBlockSize);

//   console.log(encoder, wavView, audioBuffer, mp3Buffer);

//   // Loop through the WAV data and encode it into MP3
// for (let i = 44; i < audioBuffer.byteLength; i += 2) {
//   if (i + 1 < audioBuffer.byteLength) {
//     const sample = wavView.getInt16(i, true); // Little-endian
//     samplesMono[(i - 44) / 2] = sample;
//     if ((i - 44) % (sampleBlockSize * 2) === 0) {
//       const mp3Data = encoder.encodeBuffer(samplesMono);
//       if (mp3Data.length > 0) {
//         mp3Buffer.push(new Int8Array(mp3Data));
//       }
//     }
//   } else {
//     break; // Break the loop if the offset is out of bounds
//   }
// }

//   const mp3Data = encoder.flush();
//   if (mp3Data.length > 0) {
//     mp3Buffer.push(new Int8Array(mp3Data));
//   }

// 	const mp3Concatenated = new Int8Array(mp3Buffer.reduce((acc, chunk) => acc.concat(chunk), []));

//   const mp3Blob = new Blob(mp3Concatenated, { type: 'audio/mp3' });
//   return mp3Blob;

//   // --------------------------------------------------------
//   } catch (err) {
//     console.log('audio convert error : ', err);
//   }
// };

export { convertToMP3 };
