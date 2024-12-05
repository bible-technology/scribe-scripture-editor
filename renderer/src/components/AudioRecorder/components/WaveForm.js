/* eslint-disable react-hooks/exhaustive-deps */
import {
  useEffect, forwardRef, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import WaveSurfer from 'wavesurfer.js';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
// eslint-disable-next-line import/extensions
import MicrophonePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.microphone.js';

// eslint-disable-next-line prefer-const
let microphone = MicrophonePlugin.create();
const AudioWaveForm = ((props, ref) => {
  const {
    height,
    waveColor,
    url,
    call,
    show,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    volume,
    speed,
    setTrigger,
    interaction,
    btnColor,
    barGap,
    barWidth,
    barRadius,
    setAudioPlayBack,
  } = props;

  const waveformRef = useRef(null);
  // eslint-disable-next-line prefer-const
  let wavesurfer = useRef(null);
  // eslint-disable-next-line prefer-const
  // let microphone = useRef(null);
  const [playing, setPlaying] = useState(false);
  const combinedRef = ref || waveformRef;
  const formWaveSurferOptions = (ref) => ({
    container: ref || '#waveform',
    waveColor,
    progressColor: '#0073E5',
    cursorColor: 'OrangeRed',
    barWidth: barWidth ?? 1,
    barRadius: barRadius ?? 1,
    barGap: barGap ?? 2,
    responsive: true,
    height,
    // normalize: true,
    // partialRender: true,
    hideScrollbar: true,
    interact: interaction ?? true,
    backend: 'MediaElement',
    plugins: [
      microphone,
    ],
  });

  const createForm = async (currentUrl) => {
    const options = formWaveSurferOptions(combinedRef.current);
    wavesurfer.current = WaveSurfer.create(options);
    // Below url is for testing/development purpose
    // const currentUrl = 'https://www.mfiles.co.uk/mp3-downloads/brahms-st-anthony-chorale-theme-two-pianos.mp3';
    wavesurfer.current?.load(currentUrl);
    // wavesurfer.current?.setVolume(volume);
    wavesurfer.current?.setPlaybackRate(speed);
    wavesurfer.current.on('ready', () => {
      const duration = wavesurfer?.current?.getDuration();
      if (duration && duration !== Infinity) {
        setAudioPlayBack(duration);
      } else {
        setAudioPlayBack(0);
      }
    });

    wavesurfer.current.on('audioprocess', (time) => {
      setAudioPlayBack(time);
    });

    wavesurfer.current.on('seeking', (time) => {
      setAudioPlayBack(time);
    });
  };

  const createRecForm = async () => {
    const options = formWaveSurferOptions(combinedRef.current);
    wavesurfer.current = WaveSurfer.create(options);
    wavesurfer.current?.microphone.on('deviceReady', (stream) => {
      // eslint-disable-next-line no-console
      console.log('Device ready!', stream);
    });
    wavesurfer.current?.microphone.on('deviceError', (code) => {
      // eslint-disable-next-line no-console
      console.warn(`Device error: ${ code}`);
    });
  };

  useEffect(() => {
    if (url) {
      createForm(url);

      return () => {
        if (wavesurfer.current) {
          wavesurfer.current.destroy();
          wavesurfer.current.microphone.destroy();
          setAudioPlayBack(0);
        }
      };
    }
  }, [url]);
  useEffect(() => {
    if (call === 'record') {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current.microphone.destroy();
      }
      createRecForm();

      return () => {
        if (wavesurfer.current) {
          wavesurfer.current.destroy();
          wavesurfer.current.microphone.destroy();
        }
      };
    }
  }, [call]);
  useEffect(() => {
    if (volume && wavesurfer.current && url) {
      wavesurfer.current?.setVolume(volume);
    }
    if (speed && wavesurfer.current && url) {
      wavesurfer.current?.setPlaybackRate(speed);
    }
  }, [volume, speed]);

  const handlePlayPause = () => {
    setPlaying(!playing);
    wavesurfer.current?.playPause();
  };
  const handleRewind = () => {
    if (url) {
      wavesurfer.current?.stop();
    }
  };
  const handlePlay = () => {
    if (url) {
      try {
        wavesurfer.current?.setVolume(volume);
        wavesurfer.current?.play();
      } catch {
        createForm(url);
        handlePlay();
      }

      setTrigger();
    }
  };
  const handlePause = () => {
    if (url) {
      wavesurfer.current?.pause();
    }
  };
  const handleStart = () => {
    startRecording();
    wavesurfer.current?.microphone.start();
  };
  const handleStop = () => {
    stopRecording();
    wavesurfer.current?.microphone.stop();
  };

  useEffect(() => {
    switch (call) {
    case 'play':
      handlePlay();
      break;
    case 'pause':
      handlePause();
      break;
    case 'rewind':
      handleRewind();
      break;
    case 'record':
      handleStart();
      break;
    case 'recPause':
      pauseRecording();
      break;
    case 'recResume':
      resumeRecording();
      break;
    case 'recStop':
      handleStop();
      break;
    default:
      break;
    }
  }, [call]);
  return (
    <div className="flex items-center">
      {/* <div id="waveform" ref={waveformRef} /> */}
      {/* <div className="w-full">
        <div id="waveform" ref={waveformRef} />
      </div> */}
      {(url || call === 'record')
        && (
          <>
            <div className="w-full">
              <div id="waveform" ref={combinedRef} />
            </div>
            {show
            && (
              <button type="button" onClick={handlePlayPause}>
                {!playing
                  ? (
                    <PlayIcon
                      // fill="currentColor"
                      className={`w-7 h-7 ${btnColor}`}
                      aria-hidden="true"
                    />
                  )
                  : (
                    <PauseIcon
                      // fill="currentColor"
                      className="w-7 h-7 text-error"
                      aria-hidden="true"
                    />
                  )}
              </button>
            )}
          </>
        )}
    </div>
  );
});
export default forwardRef(AudioWaveForm);
AudioWaveForm.propTypes = {
  height: PropTypes.number,
  waveColor: PropTypes.string,
  btnColor: PropTypes.string,
  barGap: PropTypes.number,
  barWidth: PropTypes.number,
  barRadius: PropTypes.number,
  url: PropTypes.string,
  show: PropTypes.bool,
  volume: PropTypes.any,
  speed: PropTypes.any,
  call: PropTypes.any,
  startRecording: PropTypes.func,
  stopRecording: PropTypes.func,
  pauseRecording: PropTypes.func,
  resumeRecording: PropTypes.func,
  setTrigger: PropTypes.func,
  interaction: PropTypes.bool,
  setAudioPlayBack: PropTypes.any,
};
