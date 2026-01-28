import {
  useState, useRef, useEffect, useCallback,
} from 'react';
import * as logger from '../../../logger';

const getCameraErrorMessage = (err) => {
  if (!err) { return 'Unknown error'; }

  switch (err.name) {
  case 'NotAllowedError':
    return 'Camera permission denied. Please allow camera access.';
  case 'NotFoundError':
    return 'No camera found. Please connect a camera.';
  case 'OverconstrainedError':
    return 'Camera constraints not supported. Trying fallback...';
  default:
    return 'Failed to access camera. Please check your camera connection.';
  }
};

const getPreferredCamera = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((device) => device.kind === 'videoinput');

    if (videoDevices.length === 0) {
      throw new Error('No camera devices found');
    }

    const builtInKeywords = ['integrated', 'built-in', 'webcam', 'facetime'];
    const usbCamera = videoDevices.find((device) => device.label.toLowerCase().includes('usb'));

    if (usbCamera) {
      return usbCamera.deviceId;
    }

    const externalCamera = videoDevices.find((device) => {
      const label = device.label.toLowerCase();
      return !builtInKeywords.some((keyword) => label.includes(keyword));
    });

    if (externalCamera) {
      return externalCamera.deviceId;
    }

    return videoDevices[0].deviceId;
  } catch (err) {
    logger.error('Error enumerating devices:', err);
    return null;
  }
};

export const useCamera = ({
  isAudioEnabled,
  currentMode,
  selectedCamera,
  videoPreviewRef,
  onError,
  clearError,
  verse,
  chapter,
}) => {
  const [cameraReady, setCameraReady] = useState(false);
  const [videoDevices, setVideoDevices] = useState([]);
  const streamRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      if (currentMode === 'view') {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        setCameraReady(false);
        return;
      }

      try {
        const tempStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        tempStream.getTracks().forEach((track) => track.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter((d) => d.kind === 'videoinput');
        if (mounted) {
          setVideoDevices(cams);
        }

        const targetCameraId = selectedCamera || (await getPreferredCamera());
        const constraints = {
          video: targetCameraId
            ? {
              deviceId: { exact: targetCameraId },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: 30 },
            }
            : {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: 30 },
            },
          audio: isAudioEnabled,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          videoPreviewRef.current.onloadedmetadata = () => {
            if (mounted) {
              videoPreviewRef.current.play();
              setCameraReady(true);

              const videoTrack = stream.getVideoTracks()[0];
              logger.debug('Using camera:', videoTrack.label);
            }
          };
        }
      } catch (err) {
        if (mounted) {
          logger.error('Camera initialization error:', err);
          onError(getCameraErrorMessage(err));

          if (err.name === 'OverconstrainedError') {
            try {
              const fallbackStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: isAudioEnabled,
              });

              if (mounted && videoPreviewRef.current) {
                streamRef.current = fallbackStream;
                videoPreviewRef.current.srcObject = fallbackStream;
                videoPreviewRef.current.onloadedmetadata = () => {
                  if (mounted) {
                    videoPreviewRef.current.play();
                    setCameraReady(true);
                    clearError();
                  }
                };
              }
            } catch (fallbackErr) {
              logger.error('Fallback camera access failed:', fallbackErr);
            }
          }
        }
      }
    };

    initCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isAudioEnabled, currentMode, selectedCamera, verse, chapter, videoPreviewRef, onError, clearError]);

  const toggleAudio = useCallback(async (isRecording) => {
    if (isRecording) {
      onError('Cannot change audio settings while recording');
      return false;
    }

    setCameraReady(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    return true;
  }, [onError]);

  return {
    cameraReady,
    videoDevices,
    streamRef,
    toggleAudio,
  };
};
