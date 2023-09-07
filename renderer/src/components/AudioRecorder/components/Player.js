/* eslint-disable no-nested-ternary */
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
  const [volume, setVolume] = useState(0.5);
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const speed = [0.5, 1, 1.5, 2];
  const path = require('path');
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
        setVolume((prev) => (prev > 0.9 ? prev : prev + 0.1));
        break;
      case 189: // --> - (left to +)
        setVolume((prev) => (prev < 0.1 ? prev : prev - 0.1));
        break;

      default:
        break;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]); // ---> change to space for play and pause

  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

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
                  onClick={() => setTrigger('recPause')}
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
                  onClick={() => setTrigger('recResume')}
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
                onClick={() => setTrigger('recStop')}
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
                onClick={() => setTrigger('rewind')}
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
                {t('label-delete')}
              </div>
              <div className="flex gap-2 mt-2 items-center justify-center">
                <button
                  type="button"
                  className="rounded-md hover:bg-primary"
                  title="-"
                  onClick={() => setVolume(
                  volume < 0.1 ? volume : volume - 0.1,
                )}
                >
                  <MinusIcon
                    className="w-4 h-4"
                    aria-hidden="true"
                  />
                </button>
                <input
                  type="range"
                  className="md:w-12 w-full xl:w-44"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                />
                <button
                  type="button"
                  className="rounded-md hover:bg-primary"
                  title="+"
                  onClick={() => setVolume(
                  volume > 0.9 ? volume : volume + 0.1,
                )}
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
                className={`${
              take === 'take1'
                ? 'border-2 border-yellow-400'
                : ''
            } w-6 h-6 flex items-center justify-center ${
              url?.take1
                ? url?.default === 'take1'
                  ? 'bg-primary'
                  : 'bg-success'
                : 'bg-white'
            } text-xs font-bold ${
              url?.take1 ? 'text-white' : 'text-black'
            } uppercase tracking-wider rounded-full`}
                onClick={() => changeTake('take1')}
                title="select : A"
                onDoubleClick={() => changeDefault(1)}
              >
                a
              </button>
              <button
                type="button"
                className={`${
              take === 'take2'
                ? 'border-2 border-yellow-400'
                : ''
            } w-6 h-6 flex items-center justify-center ${
              url?.take2
                ? url?.default === 'take2'
                  ? 'bg-primary'
                  : 'bg-success'
                : 'bg-white'
            } text-xs font-bold ${
              url?.take2 ? 'text-white' : 'text-black'
            } uppercase tracking-wider rounded-full`}
                onClick={() => changeTake('take2')}
                title="select : B"
                onDoubleClick={() => changeDefault(2)}
              >
                b
              </button>
              <button
                type="button"
                className={`${
              take === 'take3'
                ? 'border-2 border-yellow-400'
                : ''
            } w-6 h-6 flex items-center justify-center ${
              url?.take3
                ? url?.default === 'take3'
                  ? 'bg-primary'
                  : 'bg-success'
                : 'bg-white'
            } text-xs font-bold ${
              url?.take3 ? 'text-white' : 'text-black'
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
          <AudioWaveform
            height={80}
            barGap="4"
            barWidth="2"
            waveColor="#ffffff"
            btnColor="text-white"
        // url={(location && Object.keys(url).length !== 0) && (take ? (url[take] ? url[take] : '') : url[url?.default])}
            url={blobUrl || (location
          && Object.keys(url).length !== 0
          && (take
            ? url[take]
              ? path.join(location, url[take])
              : ''
            : path.join(location, url[url?.default])))}
            call={trigger}
            startRecording={startRecording}
            stopRecording={stopRecording}
            pauseRecording={pauseRecording}
            resumeRecording={resumeRecording}
            volume={volume}
            speed={currentSpeed}
            show={false}
            setTrigger={setTrigger}
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
