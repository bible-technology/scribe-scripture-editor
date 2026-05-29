import { useState, useRef, useCallback } from 'react';
import * as logger from '../../../logger';

export const useVideoRecording = ({
  chapter,
  verse,
  projectPath,
  streamRef,
  onSaveComplete,
  onError,
  fileNameOverride,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  const fs = window.require('fs');
  const path = window.require('path');

  const saveVideo = useCallback(async (blob) => {
    setIsProcessing(true);
    let tempPath = null;
    let backupPath = null;
    let filePath = null;

    try {
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const filename = fileNameOverride || `${chapter}_${verse}.webm`;
      filePath = path.join(projectPath, filename);

      if (fileNameOverride && fs.existsSync(filePath)) {
        tempPath = path.join(
          projectPath,
          `.${filename}.${Date.now()}.tmp`,
        );
        backupPath = path.join(
          projectPath,
          `.${filename}.${Date.now()}.backup`,
        );

        fs.writeFileSync(tempPath, buffer);
        fs.renameSync(filePath, backupPath);
        fs.renameSync(tempPath, filePath);
        try {
          fs.unlinkSync(backupPath);
        } catch (cleanupErr) {
          logger.warn('Could not remove previous video backup:', cleanupErr);
        }
      } else {
        fs.writeFileSync(filePath, buffer);
      }

      if (onSaveComplete) {
        onSaveComplete({
          verse,
          chapter,
          filePath,
          filename,
          buffer,
        });
      }

      setIsProcessing(false);
      return true;
    } catch (err) {
      try {
        if (backupPath && filePath && fs.existsSync(backupPath) && !fs.existsSync(filePath)) {
          fs.renameSync(backupPath, filePath);
        }
        if (tempPath && fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (restoreErr) {
        logger.error('Error restoring previous video after save failure:', restoreErr);
      }
      logger.error('Error saving video:', err);
      onError(`Failed to save video: ${err.message}`);
      setIsProcessing(false);
      return false;
    }
  }, [chapter, verse, projectPath, onSaveComplete, onError, fileNameOverride]);

  const startRecording = useCallback(async () => {
    if (!streamRef.current) {
      onError('Camera not ready');
      return;
    }

    try {
      const filename = fileNameOverride || `${chapter}_${verse}.webm`;
      const filePath = path.join(projectPath, filename);

      if (!fileNameOverride && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.debug('Deleted existing video for re-recording');
      }

      const options = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000,
      };

      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm;codecs=vp8';
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        await saveVideo(blob);
      };

      mediaRecorder.onerror = () => {
        onError('Recording failed. Please try again.');
        setIsRecording(false);
        setIsPaused(false);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      onError('Failed to start recording. Please try again.');
    }
  }, [chapter, verse, projectPath, streamRef, saveVideo, onError, fileNameOverride]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      logger.debug('Recording paused');
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      logger.debug('Recording resumed');
    }
  }, [isRecording, isPaused]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  return {
    isRecording,
    isPaused,
    recordingTime,
    isProcessing,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  };
};
