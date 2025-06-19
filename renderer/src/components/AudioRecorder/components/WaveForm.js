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

    // Set up event listeners BEFORE loading
    wavesurfer.current.on('ready', () => {
      const duration = wavesurfer?.current?.getDuration();
      if (duration && duration !== Infinity) {
        setAudioPlayBack(duration);
      } else {
        setAudioPlayBack(0);
      }
    });

    // Fixed: Use 'audioprocess' for current time during playback
    wavesurfer.current.on('audioprocess', (time) => {
      setAudioPlayBack(time);
    });

    // Fixed: Handle seeking properly
    wavesurfer.current.on('seek', (progress) => {
      const duration = wavesurfer.current.getDuration();
      const seekTime = progress * duration;
      setAudioPlayBack(seekTime);
    });

    // Fixed: Add play/pause event listeners to sync state
    wavesurfer.current.on('play', () => {
      setPlaying(true);
    });

    wavesurfer.current.on('pause', () => {
      setPlaying(false);
    });

    wavesurfer.current.on('finish', () => {
      setPlaying(false);
    });

    // Load the audio file
    wavesurfer.current?.load(currentUrl);
    wavesurfer.current?.setVolume(volume || 0.5);
    wavesurfer.current?.setPlaybackRate(speed || 1);
  };

  const createRecForm = async () => {
    const options = formWaveSurferOptions(combinedRef.current);
    wavesurfer.current = WaveSurfer.create(options);

    wavesurfer.current?.microphone.on('deviceReady', (stream) => {
      console.log('Device ready!', stream);
    });

    wavesurfer.current?.microphone.on('deviceError', (code) => {
      console.warn(`Device error: ${code}`);
    });
  };

  useEffect(() => {
    if (url) {
      createForm(url);

      return () => {
        if (wavesurfer.current) {
          wavesurfer.current.destroy();
          if (wavesurfer.current.microphone) {
            wavesurfer.current.microphone.destroy();
          }
          setAudioPlayBack(0);
        }
      };
    }
  }, [url]);

  useEffect(() => {
    if (call === 'record') {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        if (wavesurfer.current.microphone) {
          wavesurfer.current.microphone.destroy();
        }
      }
      createRecForm();

      return () => {
        if (wavesurfer.current) {
          wavesurfer.current.destroy();
          if (wavesurfer.current.microphone) {
            wavesurfer.current.microphone.destroy();
          }
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
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
      // Don't manually set playing state here - let the event listeners handle it
    }
  };

  const handleRewind = () => {
    if (url && wavesurfer.current) {
      wavesurfer.current.stop();
      wavesurfer.current.seekTo(0);
      setAudioPlayBack(0);
      setPlaying(false);
    }
  };

  const handlePlay = () => {
    if (url && wavesurfer.current) {
      try {
        wavesurfer.current.setVolume(volume || 0.5);
        wavesurfer.current.play();
        setTrigger();
      } catch (error) {
        console.error('Error playing audio:', error);
        createForm(url);
        // Retry after recreation
        setTimeout(() => {
          if (wavesurfer.current) {
            wavesurfer.current.play();
          }
        }, 100);
      }
    }
  };

  const handlePause = () => {
    if (url && wavesurfer.current) {
      wavesurfer.current.pause();
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
                      className={`w-7 h-7 ${btnColor}`}
                      aria-hidden="true"
                    />
                  )
                  : (
                    <PauseIcon
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
