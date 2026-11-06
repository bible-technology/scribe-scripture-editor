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

const getPreferredCamera = (videoDevices = []) => {
  if (!videoDevices || videoDevices.length === 0) {
    return null;
  }

  const builtInKeywords = ['integrated', 'built-in', 'webcam', 'facetime'];
  const usbCamera = videoDevices.find((device) => device.label && device.label.toLowerCase().includes('usb'));

  if (usbCamera) {
    return usbCamera.deviceId;
  }

  const externalCamera = videoDevices.find((device) => {
    const label = (device.label || '').toLowerCase();
    return !builtInKeywords.some((keyword) => label.includes(keyword));
  });

  if (externalCamera) {
    return externalCamera.deviceId;
  }

  return videoDevices[0].deviceId;
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
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter((d) => d.kind === 'videoinput');
        if (mounted) {
          setVideoDevices(cams);
        }

        const targetCameraId = selectedCamera || getPreferredCamera(cams);
        const constraints = {
          video: targetCameraId
            ? {
              deviceId: { exact: targetCameraId },
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
              frameRate: { ideal: 30 },
            }
            : {
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
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

        // Update device labels now that camera permission/stream is active
        try {
          const activeDevices = await navigator.mediaDevices.enumerateDevices();
          const activeCams = activeDevices.filter((d) => d.kind === 'videoinput');
          if (mounted && activeCams.length > 0) {
            setVideoDevices(activeCams);
          }
        } catch (enumErr) {
          logger.debug('Could not re-enumerate camera devices:', enumErr);
        }

        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          videoPreviewRef.current.onloadedmetadata = () => {
            if (mounted) {
              videoPreviewRef.current.play().catch(() => {});
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
        streamRef.current = null;
      }
      if (videoPreviewRef?.current) {
        videoPreviewRef.current.srcObject = null;
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
