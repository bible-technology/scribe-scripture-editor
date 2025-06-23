/* eslint-disable */
import {
  TrashIcon,
  MicrophoneIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  CogIcon,
  MinusIcon,
  PlusIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Listbox } from '@headlessui/react';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import PlayIcon from '@/icons/basil/Outline/Media/Play.svg';
import PauseIcon from '@/icons/basil/Outline/Media/Pause.svg';

const LS_AUDIO_VOLUME_KEY = 'audio-volume';

const AudioWaveform = dynamic(() => import('./WaveForm'), { ssr: false });

const Player = ({
  url,
  blobUrl,
  setBlobUrl,
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  take,
  setTake,
  changeDefault,
  setOpenModal,
  trigger,
  setTrigger,
  location,
}) => {
  const { t } = useTranslation();
  const [volume, setVolume] = useState((Number(localStorage.getItem(LS_AUDIO_VOLUME_KEY)) && typeof Number(localStorage.getItem(LS_AUDIO_VOLUME_KEY) === 'number')) ? Number(localStorage.getItem(LS_AUDIO_VOLUME_KEY)) : 0.5);
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const speed = [0.5, 1, 1.5, 2];
  const path = require('path');
  const [time, setTime] = useState(0);
  // Fixed: Separate state for current playback time
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  // state to check stopwatch running or not
  const [isRunning, setIsRunning] = useState(false);
  // Add state to track recording status
  const [isRecording, setIsRecording] = useState(false);
  // Fixed: Remove duplicate currentTime state, use currentPlaybackTime instead

  const handleVolumeChange = (action, value = 0.1, sliding = false) => {
    // sliding the value will be tha actual value of slide
    if (sliding) {
      setVolume(value);
    } else if (action === 'inc' && !sliding) {
      // if not sliding the value will be the step value
      setVolume((prev) => (prev > 0.9 ? prev : prev + value));
    } else if (action === 'dec' && !sliding) {
      setVolume((prev) => (prev < 0.1 ? prev : prev - value));
    }
  };

  // volume
  useEffect(() => {
    localStorage.setItem(LS_AUDIO_VOLUME_KEY, volume);
  }, [volume]);

  useEffect(() => {
    let intervalId;
    if (isRunning) {
      // setting time from 0 to 1 every 10 milisecond using javascript setInterval method
      intervalId = setInterval(() => setTime(time + 1), 10);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, time]);

  // Update recording status based on trigger
  useEffect(() => {
    switch (trigger) {
      case 'record':
      case 'recResume':
        setIsRecording(true);
        setIsRunning(true);
        break;
      case 'recPause':
        setIsRecording(true);
        setIsRunning(false);
        break;
      case 'recStop':
        setIsRecording(false);
        setIsRunning(false);
        break;
      case 'play':
        if (!isRecording) {
          setIsRunning(false);
        }
        break;
      case 'rewind':
        if (!isRecording) {
          setIsRunning(false);
        }
        break;
      case 'pause':
        if (!isRecording) {
          setIsRunning(false);
        }
        break;
      default:
        if (!trigger) {
          setIsRecording(false);
          setIsRunning(false);
        }
        break;
    }
  }, [trigger, isRecording]);

  // Reset timer when changing takes or starting new recording
  useEffect(() => {
    if (trigger === 'record' || !url[take]) {
      setTime(0);
      setCurrentPlaybackTime(0);
    }
  }, [take, trigger]);

  // Fixed: Update display time logic
  const getDisplayTime = () => {
    if (isRecording) {
      // During recording, show recording time in centiseconds
      return time;
    } else {
      // During playback, show playback time converted to centiseconds
      return Math.floor(currentPlaybackTime * 100);
    }
  };

  const displayTime = getDisplayTime();

  // Time calculations - works for both recording (centiseconds) and playback (converted to centiseconds)
  const minutes = Math.floor(displayTime / 6000); // 6000 centiseconds = 1 minute
  const seconds = Math.floor((displayTime % 6000) / 100); // 100 centiseconds = 1 second
  const milliseconds = Math.floor(displayTime % 100); // Convert to milliseconds for display

  const handleRecord = () => {
    // check whether its a first record or re-recording
    if (url[take]) {
      setOpenModal({
        openModel: true,
        title: t('modal-title-re-record'),
        confirmMessage: t('msg-re-record-audio'),
        buttonName: t('label-re-record'),
      });
    } else {
      // Recording for the first time
      setTrigger('record');
      setTime(0);
      setCurrentPlaybackTime(0);
      setIsRunning(true);
      setIsRecording(true);
    }
  };
  
  const handleDelete = () => {
    // check whether its a first record or re-recording
    if (url[take]) {
      setOpenModal({
        openModel: true,
        title: t('modal-title-delete-audio'),
        confirmMessage: t('msg-delete-audio'),
        buttonName: t('label-delete'),
      });
      setTrigger('delete');
    }
  };
  
  const changeTake = (value) => {
    setTake(value);
    setTrigger();
    setBlobUrl();
    // Reset timer when changing takes
    setTime(0);
    setCurrentPlaybackTime(0);
    setIsRunning(false);
    setIsRecording(false);
  };
  
  const micSettings = () => {
    const { shell } = window.require('electron');
    shell.openExternal('ms-settings:sound');
    shell.openExternal('x-apple.systempreferences:');
  };

  const handleKeyPress = useCallback((event) => {
    const keyCode = event.keyCode;
    switch (keyCode) {
      case 82: // --> r
        handleRecord();
        break;
      case 69: // --> e
        setTrigger('recResume');
        break;
      case 80: // --> p
        setTrigger('recPause');
        break;
      case 83: // --> s
        setTrigger('recStop');
        break;
      case 188: // --> , comma
        setTrigger('rewind');
        break;
      case 32: // --> space
        setTrigger('pause');
        break;
      case 13: // --> Enter / Return
        setTrigger('play');
        break;
      case 65: // --> a
        changeTake('take1');
        break;
      case 66: // --> b
        changeTake('take2');
        break;
      case 67: // --> c
        changeTake('take3');
        break;
      case 187: // --> + (not in number area)
        handleVolumeChange('inc');
        break;
      case 189: // --> - (left to +)
        handleVolumeChange('dec');
        break;
      default:
        break;
    }
  }, [trigger, url, take]); // Add dependencies

  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Fixed: Callback function to receive current playback time from waveform
  const handleAudioPlayBackUpdate = useCallback((timeValue) => {
    if (typeof timeValue === 'number') {
      setCurrentPlaybackTime(timeValue);
    }
  }, []);

  console.log("timer", time);
  console.log("isRecording", isRecording);
  console.log("trigger", trigger);
  console.log("currentPlaybackTime", currentPlaybackTime);
  console.log("displayTime", displayTime);

  return (
    <div className="relative">
      <div className="relative bottom-0">
        <div className="grid grid-flow-col auto-cols-fr text-white bg-black transparent p-1 justify-between items-center">
          <div className="flex flex-col px-10 items-center border-r border-r-gray-800">
            <div className="text-xxs text-gray-300 uppercase tracking-wider mb-2">
              {t('label-audio-bible')}
            </div>
            <button
              type="button"
              className="flex justify-center mt-1 items-center px-2 py-1 text-white
            font-semibold text-xxs rounded-full leading-3 tracking-wider uppercase bg-primary"
            >
              <div className="">target</div>
            </button>
          </div>
          <div className="flex flex-col px-10 items-center border-r border-r-gray-800">
            <div className="text-xxs text-gray-300 uppercase tracking-wider mb-2">
              {t('label-speed')}
            </div>
            <Listbox value={currentSpeed} onChange={setCurrentSpeed}>
              <Listbox.Button
                className="flex justify-center z-10 items-center px-2 py-1 text-white
                    font-semibold text-xxs rounded-full leading-3 tracking-wider uppercase bg-primary"
              >
                {currentSpeed}
                <ChevronDownIcon
                  className="w-3 h-3 ml-1"
                  aria-hidden="true"
                />
              </Listbox.Button>
              <Listbox.Options className="grid grid-flow-col auto-cols-fr overflow-auto rounded-md mt-0.5 border-2 lg:w-32 md:w-28 items-center text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {speed.map((s) => (
                  <Listbox.Option
                    key={s}
                    value={s}
                    className="flex p-1 hover:bg-gray-300 hover:text-black cursor-pointer"
                  >
                    {s}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>
          </div>
          <div className="flex flex-col px-10 items-center border-r border-r-gray-800">
            <div className="flex flex-col items-center text-xl">
              <div className="text-xs text-gray-300 uppercase tracking-wider">
                m:s:ms
              </div>
              <div>
                {minutes.toString().padStart(2, '0')}
                :
                {seconds.toString().padStart(2, '0')}
                :
                {milliseconds.toString().padStart(2, '0')}
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center justify-evenly border-r border-r-gray-800">
            <div className="flex flex-col items-center">
              {((trigger === 'record' || trigger === 'recResume') && (
                <>
                  <div className="text-xxs text-gray-300 uppercase tracking-wider mb-2">
                    {t('label-pause')}
                  </div>
                  <button
                    type="button"
                    title="P"
                    className="p-2 bg-error rounded-md hover:bg-dark"
                    onClick={() => { setTrigger('recPause'); setIsRunning(false); }}
                  >
                    <PauseIcon
                      fill="currentColor"
                      className="w-5 h-5"
                      aria-hidden="true"
                    />
                  </button>
                </>
              ))
                || (trigger === 'recPause' && (
                  <>
                    <div className="text-xxs text-gray-300 uppercase tracking-wider mb-2">
                      {t('label-continue')}
                    </div>
                    <button
                      type="button"
                      title="E"
                      className="p-2 bg-dark rounded-md hover:bg-error"
                      onClick={() => { setTrigger('recResume'); setIsRunning(true); }}
                    >
                      <PlayIcon
                        fill="currentColor"
                        className="w-5 h-5"
                        aria-hidden="true"
                      />
                    </button>
                  </>
                )) || (
                  <>
                    <div className="text-xxs text-gray-300 uppercase tracking-wider mb-2">
                      {t('label-record')}
                    </div>
                    <button
                      type="button"
                      title="R"
                      className="p-2 bg-dark rounded-md hover:bg-error"
                      onClick={() => handleRecord()}
                    >
                      <MicrophoneIcon
                        className="w-5 h-5 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </>
                )}
            </div>

            <div className="flex flex-col items-center">
              <div className="text-xxs text-gray-300 uppercase tracking-wider mb-2">
                {t('label-stop')}
              </div>
              <button
                type="button"
                title="S"
                className="p-2 bg-dark rounded-md hover:bg-primary"
                onClick={() => { 
                  setTrigger('recStop'); 
                  setIsRunning(false); 
                  setIsRecording(false);
                }}
              >
                <StopIcon
                  fill="currentColor"
                  className="w-5 h-5"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
          <div className="flex flex-row lg:gap-5 md:gap-2 md:col-span-3 col-span-4 px-10 justify-center items-center border-r border-r-gray-800">
            <div className="flex flex-col items-center">
              <div className="text-xxs text-gray-300 uppercase tracking-wider mb-2">
                {t('label-rewind')}
              </div>
              <button
                type="button"
                title="<"
                className="p-2 bg-dark rounded-md hover:bg-error"
                onClick={() => { 
                  setTrigger('rewind'); 
                  setTime(0); 
                  setCurrentPlaybackTime(0);
                  if (!isRecording) {
                    setIsRunning(false);
                  }
                }}
              >
                <ArrowPathIcon
                  className="w-5 h-5"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-xxs text-gray-300 uppercase tracking-wider mb-2">
                {t('label-play')}
              </div>
              <button
                type="button"
                title="Enter"
                className="p-2 bg-dark rounded-md hover:bg-primary"
                onClick={() => setTrigger('play')}
              >
                <PlayIcon
                  fill="currentColor"
                  className="w-5 h-5"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-xxs text-gray-300 uppercase tracking-wider mb-2">
                {t('label-pause')}
              </div>
              <button
                type="button"
                title="SpaceBar"
                className="p-2 bg-dark rounded-md hover:bg-primary"
                onClick={() => setTrigger('pause')}
              >
                <PauseIcon
                  fill="currentColor"
                  className="w-5 h-5"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-xxs text-gray-300 uppercase tracking-wider mb-2">
                {t('label-delete')}
              </div>
              <div>
                <button
                  type="button"
                  className="p-2 bg-dark rounded-md hover:bg-error"
                  onClick={() => handleDelete()}
                >
                  <TrashIcon className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-xxs mb-2 text-gray-300 uppercase tracking-wider">
                {t('label-volume')}
              </div>
              <div className="flex gap-2 mt-2 items-center justify-center">
                <button
                  type="button"
                  className="rounded-md hover:bg-primary"
                  title="-"
                  onClick={() => handleVolumeChange('dec')}
                >
                  <MinusIcon
                    className="w-4 h-4"
                    aria-hidden="true"
                  />
                </button>
                <input
                  type="range"
                  className="md:w-12 w-full xl:w-44 accent-primary"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={(e) => handleVolumeChange('', Number(e.target.value), true)}
                />

                <button
                  type="button"
                  className="rounded-md hover:bg-primary"
                  title="+"
                  onClick={() => handleVolumeChange('inc')}
                >
                  <PlusIcon
                    className="w-4 h-4"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col px-10 items-center border-r border-r-gray-800">
            <div className="text-xxs text-gray-300 uppercase tracking-wider mb-2">
              {t('label-takes')}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className={`${take === 'take1'
                  ? 'border-2 border-yellow-400'
                  : ''
                  } w-6 h-6 flex items-center justify-center ${url?.take1
                    ? url?.default === 'take1'
                      ? 'bg-primary'
                      : 'bg-success'
                    : 'bg-white'
                  } text-xs font-bold ${url?.take1 ? 'text-white' : 'text-black'
                  } uppercase tracking-wider rounded-full`}
                onClick={() => changeTake('take1')}
                title="select : A"
                onDoubleClick={() => changeDefault(1)}
              >
                a
              </button>
              <button
                type="button"
                className={`${take === 'take2'
                  ? 'border-2 border-yellow-400'
                  : ''
                  } w-6 h-6 flex items-center justify-center ${url?.take2
                    ? url?.default === 'take2'
                      ? 'bg-primary'
                      : 'bg-success'
                    : 'bg-white'
                  } text-xs font-bold ${url?.take2 ? 'text-white' : 'text-black'
                  } uppercase tracking-wider rounded-full`}
                onClick={() => changeTake('take2')}
                title="select : B"
                onDoubleClick={() => changeDefault(2)}
              >
                b
              </button>
              <button
                type="button"
                className={`${take === 'take3'
                  ? 'border-2 border-yellow-400'
                  : ''
                  } w-6 h-6 flex items-center justify-center ${url?.take3
                    ? url?.default === 'take3'
                      ? 'bg-primary'
                      : 'bg-success'
                    : 'bg-white'
                  } text-xs font-bold ${url?.take3 ? 'text-white' : 'text-black'
                  } uppercase tracking-wider rounded-full`}
                onClick={() => changeTake('take3')}
                title="select : C"
                onDoubleClick={() => changeDefault(3)}
              >
                c
              </button>
            </div>
          </div>
          <div className="flex flex-col px-10 items-center">
            <div className="text-xxs text-gray-300 uppercase tracking-wider mb-2">
              {t('label-settings')}
            </div>
            <div className="flex flex-col items-center">
              <button
                type="button"
                className="p-2 bg-dark rounded-md hover:bg-error"
                onClick={() => micSettings()}
              >
                <CogIcon className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 bg-black text-white">
          {/* Always show waveform - no conditional rendering */}
          <AudioWaveform
            height={80}
            barGap="4"
            barWidth="2"
            waveColor="#ffffff"
            btnColor="text-white"
            url={
              blobUrl ||
              (() => {
                if (
                  !location ||
                  !url ||
                  Object.keys(url).length === 0
                )
                  return '';
                if (
                  take &&
                  url.takes &&
                  url.takes[take] &&
                  url.takes[take].url
                ) {
                  console.log(
                    'Using take URL:',
                    url.takes[take].url,
                  );
                  return url.takes[take].url;
                }
                // Fall back to default take
                const defaultTake =
                  url.default || url.defaultTake || 'take1';
                if (
                  url.takes &&
                  url.takes[defaultTake] &&
                  url.takes[defaultTake].url
                ) {
                  console.log(
                    'Using default take URL:',
                    url.takes[defaultTake].url,
                  );
                  return url.takes[defaultTake].url;
                }

                // Legacy fallback - construct path
                if (url[take]) {
                  const filePath = path.join(
                    location,
                    url[take],
                  );
                  const fileUrl = `file://${filePath.replace(
                    /\\/g,
                    '/',
                  )}`;
                  console.log('Using legacy URL:', fileUrl);
                  return fileUrl;
                }
                return '';
              })()
            }
            call={trigger}
            startRecording={startRecording}
            stopRecording={stopRecording}
            pauseRecording={pauseRecording}
            resumeRecording={resumeRecording}
            volume={volume}
            speed={currentSpeed}
            show={false}
            setTrigger={setTrigger}
            setAudioPlayBack={setCurrentPlaybackTime}
          />
        </div>
      </div>
    </div>
  );
};
export default Player;
Player.propTypes = {
  url: PropTypes.object,
  blobUrl: PropTypes.string,
  setBlobUrl: PropTypes.any,
  startRecording: PropTypes.any,
  stopRecording: PropTypes.any,
  pauseRecording: PropTypes.any,
  resumeRecording: PropTypes.any,
  take: PropTypes.string,
  setTake: PropTypes.any,
  changeDefault: PropTypes.func,
  setOpenModal: PropTypes.func,
  trigger: PropTypes.string,
  setTrigger: PropTypes.any,
  location: PropTypes.any,
};