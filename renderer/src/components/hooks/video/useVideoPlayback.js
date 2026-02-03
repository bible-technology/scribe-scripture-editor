import {
  useState, useRef, useEffect, useCallback,
} from 'react';
import * as logger from '../../../logger';

export const useVideoPlayback = ({
  currentMode,
  hasVideo,
  verse,
  chapter,
  projectPath,
  videoPreviewRef,
  onError,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const playbackTimerRef = useRef(null);

  const fs = window.require('fs');
  const path = window.require('path');

  useEffect(() => {
    if (currentMode === 'view' && hasVideo && videoPreviewRef.current) {
      const videoExt = ['webm', 'mp4'].find((ext) => fs.existsSync(path.join(projectPath, `${chapter}_${verse}.${ext}`)));

      if (!videoExt) {
        onError('Video file not found');
        return;
      }

      const filename = `${chapter}_${verse}.${videoExt}`;
      const fullPath = path.join(projectPath, filename);

      try {
        if (!fs.existsSync(fullPath)) {
          logger.error('Video file does not exist:', fullPath);
          onError(`Video file not found: ${filename}`);
          return;
        }

        const stats = fs.statSync(fullPath);
        logger.debug('Video file size:', stats.size);

        if (stats.size === 0) {
          onError('Video file is empty');
          return;
        }
      } catch (err) {
        logger.error('Error checking video file:', err);
        onError(`Cannot access video: ${err.message}`);
        return;
      }

      const buffer = fs.readFileSync(fullPath);
      const mimeType = videoExt === 'mp4' ? 'video/mp4' : 'video/webm';
      const blob = new Blob([buffer], { type: mimeType });
      const videoPath = URL.createObjectURL(blob);

      logger.debug('Loading video from Blob URL:', videoPath);

      setIsPlaying(false);
      setPlaybackTime(0);

      const video = videoPreviewRef.current;

      video.pause();
      video.srcObject = null;
      video.removeAttribute('src');
      video.load();

      setTimeout(() => {
        if (!videoPreviewRef.current) { return; }
        video.src = videoPath;
        video.load();
        video.onloadedmetadata = () => {
          if (!videoPreviewRef.current) { return; }
          let dur = video.duration;

          if (!Number.isFinite(dur) || dur === 0) {
            logger.warn('Duration invalid, forcing recalculation...');
            video.currentTime = 1e101;
            video.ontimeupdate = () => {
              if (!videoPreviewRef.current) { return; }
              video.ontimeupdate = null;
              dur = video.duration;
              if (Number.isFinite(dur)) {
                setVideoDuration(dur);
              } else {
                setVideoDuration(0);
              }
              video.currentTime = 0;
            };
          } else {
            setVideoDuration(dur);
          }
        };

        video.onloadeddata = () => {
          if (!videoPreviewRef.current) { return; }
          logger.debug('Video data loaded and ready to play');
        };

        video.onerror = (e) => {
          logger.error('Video load error:', e);
          onError('Failed to load video file');
        };
      }, 50);
    }
  }, [currentMode, hasVideo, verse, chapter, projectPath]);

  useEffect(() => {
    if (currentMode === 'view' && videoPreviewRef.current) {
      if (isPlaying) {
        videoPreviewRef.current.play().catch((err) => {
          logger.error('Error playing video:', err);
          setIsPlaying(false);
        });

        playbackTimerRef.current = setInterval(() => {
          if (videoPreviewRef.current) {
            setPlaybackTime(videoPreviewRef.current.currentTime);
          }
        }, 100);
      } else {
        videoPreviewRef.current.pause();

        if (playbackTimerRef.current) {
          clearInterval(playbackTimerRef.current);
          playbackTimerRef.current = null;
        }
        if (videoPreviewRef.current) {
          setPlaybackTime(videoPreviewRef.current.currentTime);
        }
      }
    }

    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    };
  }, [isPlaying, currentMode]);

  useEffect(() => {
    if (videoPreviewRef.current && currentMode === 'view') {
      videoPreviewRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, currentMode]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const seek = useCallback((time) => {
    if (videoPreviewRef.current) {
      videoPreviewRef.current.currentTime = time;
      setPlaybackTime(time);
    }
  }, []);

  const cycleSpeed = useCallback(() => {
    setPlaybackSpeed((prev) => {
      const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
      const index = speeds.indexOf(prev);
      return speeds[(index + 1) % speeds.length];
    });
  }, []);

  const resetPlayback = useCallback(() => {
    if (videoPreviewRef.current) {
      const video = videoPreviewRef.current;
      video.pause();
      video.srcObject = null;
      video.removeAttribute('src');
      video.load();
    }
    setIsPlaying(false);
  }, []);

  return {
    isPlaying,
    playbackTime,
    videoDuration,
    playbackSpeed,
    togglePlayPause,
    seek,
    cycleSpeed,
    resetPlayback,
    setIsPlaying,
  };
};
