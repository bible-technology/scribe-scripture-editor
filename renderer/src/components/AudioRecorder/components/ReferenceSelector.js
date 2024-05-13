import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';

const AudioWaveform = dynamic(() => import('./WaveForm'), { ssr: false });

export default function ReferenceSelector({ data, versepath, verse }) {
  const path = require('path');
  return (
    <div className="bg-white col-span-3 m-3 rounded-md shadow overflow-hidden">
      <div className="px-3 py-2 rounded-md shadow overflow-y-auto h-full no-scrollbars">
        {data?.map((story) => (
          story.verseNumber
          && (
          <div
            key={story.verseNumber}
            className={`mb-2 p-2 px-3 ${story.verseNumber === verse ? 'bg-light' : 'bg-gray-100'} border border-gray-200 justify-center items-start rounded-md`}
          >
            <div className="flex gap-2">
              <div>
                <div className="h-5 w-5 mt-1 flex justify-center items-center bg-primary text-white rounded-full font-semibold text-xs">
                  {story.verseNumber}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {story.verseText}
              </p>
            </div>
            <div className="mt-2">
              <AudioWaveform
                height={24}
                waveColor="#333333"
                // url={story.audio} for development
                url={story.audio ? path.join(versepath, story.audio) : ''}
                show
                setAudioPlayBack={() => {}}
              />
            </div>
          </div>
          )
        ))}
      </div>
    </div>
  );
}
ReferenceSelector.propTypes = {
  data: PropTypes.array,
  versepath: PropTypes.string,
  verse: PropTypes.string,
};
// Expected the structure of data should be -
// [
//   {verseNumber:'1',verseText:"",audio:"1_1.mp3"},
//   {verseNumber:'2-3',verseText:"",audio:"1_2-3.mp3"}
// ]
