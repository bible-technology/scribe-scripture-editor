/* eslint-disable react-hooks/exhaustive-deps */
import {
  useEffect, forwardRef, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import WaveSurfer from 'wavesurfer.js';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
// eslint-disable-next-line import/extensions
import MicrophonePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.microphone.js';

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
  const wavesurfer = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [currentMode, setCurrentMode] = useState('empty'); // 'empty', 'audio', 'recording'
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
  });

  const formRecordingOptions = (ref) => ({
    container: ref || '#waveform',
    waveColor: isRecordingPaused ? '#888888' : (waveColor || '#ff4e00'), // Gray when paused
    progressColor: '#0073E5',
    cursorColor: 'OrangeRed',
    barWidth: barWidth ?? 1,
    barRadius: barRadius ?? 1,
    barGap: barGap ?? 2,
    responsive: true,
    height: height || 60,
    hideScrollbar: true,
    interact: false,
    backend: 'WebAudio', // Use WebAudio for real-time recording
    plugins: [
      MicrophonePlugin.create({
        bufferSize: 4096,
        numberOfInputChannels: 1,
        numberOfOutputChannels: 1,
        constraints: {
          video: false,
          audio: true,
        },
      }),
    ],
  });

  const destroyWavesurfer = () => {
    if (wavesurfer.current) {
      if (wavesurfer.current.microphone) {
        wavesurfer.current.microphone.destroy();
      }
      wavesurfer.current.destroy();
      wavesurfer.current = null;
    }
  };

  const createForm = async (currentUrl) => {
    destroyWavesurfer();

    const options = formWaveSurferOptions(combinedRef.current);
    wavesurfer.current = WaveSurfer.create(options);

    wavesurfer.current.on('ready', () => {
      const duration = wavesurfer?.current?.getDuration();
      if (duration && duration !== Infinity) {
        if (setAudioPlayBack) { setAudioPlayBack(duration); }
      } else if (setAudioPlayBack) { setAudioPlayBack(0); }
      setCurrentMode('audio');
    });

    wavesurfer.current.on('audioprocess', (time) => {
      if (setAudioPlayBack) { setAudioPlayBack(time); }
    });

    wavesurfer.current.on('seek', (progress) => {
      const duration = wavesurfer.current.getDuration();
      const seekTime = progress * duration;
      if (setAudioPlayBack) { setAudioPlayBack(seekTime); }
    });

    wavesurfer.current.on('play', () => {
      setPlaying(true);
    });

    wavesurfer.current.on('pause', () => {
      setPlaying(false);
    });

    wavesurfer.current.on('finish', () => {
      setPlaying(false);
    });

    wavesurfer.current.on('error', () => {
      setPlaying(false);
    });

    // Load the audio file
    try {
      await wavesurfer.current.load(currentUrl);
      wavesurfer.current.setVolume(volume || 0.5);
      wavesurfer.current.setPlaybackRate(speed || 1);
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const createRecForm = async () => {
    destroyWavesurfer();

    const options = formRecordingOptions(combinedRef.current);
    wavesurfer.current = WaveSurfer.create(options);

    wavesurfer.current?.microphone.on('deviceReady', () => {
      setIsRecordingPaused(false);
      setCurrentMode('recording');
    });

    wavesurfer.current?.microphone.on('deviceError', () => {
      setIsRecordingPaused(false);
      setCurrentMode('empty');
    });

    // Handle microphone pause/resume events if supported
    wavesurfer.current?.microphone.on('pause', () => { });
    wavesurfer.current?.microphone.on('resume', () => { });
  };

  const createEmptyForm = () => {
    destroyWavesurfer();

    const options = formWaveSurferOptions(combinedRef.current);
    wavesurfer.current = WaveSurfer.create(options);

    // Create empty waveform (flat line)
    wavesurfer.current.empty();
    setCurrentMode('empty');
    if (setAudioPlayBack) { setAudioPlayBack(0); }
  };

  // Initialize waveform on mount
  useEffect(() => {
    createEmptyForm();

    return () => {
      destroyWavesurfer();
      setAudioPlayBack(0);
      setIsRecordingPaused(false);
    };
  }, []);

  // Handle URL changes - this is crucial for post-recording playback
  useEffect(() => {
    if (url && currentMode !== 'recording') {
      createForm(url);
    } else if (!url && currentMode !== 'recording') {
      createEmptyForm();
    }
  }, [url, currentMode]);

  // Handle recording mode changes
  useEffect(() => {
    if (call === 'record' && currentMode !== 'recording') {
      createRecForm();
    }
  }, [call]);

  // Handle recording pause state changes - recreate waveform to change appearance
  useEffect(() => {
    if (currentMode === 'recording' && wavesurfer.current) {
      const currentMicrophoneState = wavesurfer.current.microphone;
      if (currentMicrophoneState && currentMicrophoneState.active) {
        // update the waveColor through the wavesurfer instance
        wavesurfer.current.setWaveColor(isRecordingPaused ? '#888888' : (waveColor || '#ff4e00'));
      }
    }
  }, [isRecordingPaused, currentMode]);

  useEffect(() => {
    if (volume && wavesurfer.current && currentMode === 'audio') {
      wavesurfer.current?.setVolume(volume);
    }
    if (speed && wavesurfer.current && currentMode === 'audio') {
      wavesurfer.current?.setPlaybackRate(speed);
    }
  }, [volume, speed]);

  const handlePlayPause = () => {
    if (wavesurfer.current && currentMode === 'audio') {
      wavesurfer.current.playPause();
    }
  };

  const handleRewind = () => {
    if (url && wavesurfer.current && currentMode === 'audio') {
      wavesurfer.current.seekTo(0);
      if (setAudioPlayBack) {
        setAudioPlayBack(0);
      }
      try {
        wavesurfer.current.setVolume(volume || 0.5);
        wavesurfer.current.play();
        if (setTrigger) {
          setTrigger();
        }
      } catch (error) {
        createForm(url).then(() => {
          setTimeout(() => {
            if (wavesurfer.current) {
              wavesurfer.current.seekTo(0);
              wavesurfer.current.play();
            }
          }, 100);
        });
      }
    }
  };

  const handlePlay = () => {
    if (url && wavesurfer.current && currentMode === 'audio') {
      try {
        wavesurfer.current.setVolume(volume || 0.5);
        wavesurfer.current.play();
        if (setTrigger) { setTrigger(); }
      } catch (error) {
        createForm(url);
        setTimeout(() => {
          if (wavesurfer.current) {
            wavesurfer.current.play();
          }
        }, 100);
      }
    }
  };

  const handlePause = () => {
    if (url && wavesurfer.current && currentMode === 'audio') {
      wavesurfer.current.pause();
    }
  };

  const handleStart = () => {
    if (startRecording) { startRecording(); }
    if (wavesurfer.current && wavesurfer.current.microphone) {
      wavesurfer.current.microphone.start();
    }
  };

  const handleStop = () => {
    if (stopRecording) { stopRecording(); }
    if (wavesurfer.current && wavesurfer.current.microphone) {
      wavesurfer.current.microphone.stop();
    }
    setIsRecordingPaused(false);
    // After stopping recording, re-create appropriate waveform
    setTimeout(() => {
      if (url) {
        // If there's a URL (recorded audio), create audio waveform
        createForm(url);
      } else {
        // Otherwise show empty waveform
        createEmptyForm();
      }
    }, 200);
  };

  const handleRecordingPause = () => {
    if (pauseRecording) { pauseRecording(); }
    setIsRecordingPaused(true);

    // Pause the microphone input to stop real-time waveform
    if (wavesurfer.current && wavesurfer.current.microphone) {
      try {
        wavesurfer.current.microphone.pause();
      } catch (error) {
        // Alternative: temporarily disconnect the microphone
        if (wavesurfer.current.microphone.micStream) {
          wavesurfer.current.microphone.micStream.getTracks().forEach((track) => {
            track.enabled = false;
          });
        }
      }
    }
  };

  const handleRecordingResume = () => {
    if (resumeRecording) { resumeRecording(); }
    setIsRecordingPaused(false);

    // Resume the microphone input
    if (wavesurfer.current && wavesurfer.current.microphone) {
      try {
        wavesurfer.current.microphone.start();
      } catch (error) {
        // Alternative: re-enable the microphone tracks
        if (wavesurfer.current.microphone.micStream) {
          wavesurfer.current.microphone.micStream.getTracks().forEach((track) => {
            track.enabled = true;
          });
        }
      }
    }
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
      setTimeout(() => {
        if (wavesurfer.current && currentMode === 'audio') {
          wavesurfer.current.drawer && wavesurfer.current.drawer.progress(0);
        }
      }, 100);
      break;
    case 'record':
      handleStart();
      break;
    case 'recPause':
      handleRecordingPause();
      break;
    case 'recResume':
      handleRecordingResume();
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
      <div className="w-full">
        <div id="waveform" ref={combinedRef} />
      </div>

      {show && url && currentMode === 'audio' && (
        <button type="button" onClick={handlePlayPause}>
          {!playing ? (
            <PlayIcon
              className={`w-7 h-7 ${btnColor}`}
              aria-hidden="true"
            />
          ) : (
            <PauseIcon
              className="w-7 h-7 text-error"
              aria-hidden="true"
            />
          )}
        </button>
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
