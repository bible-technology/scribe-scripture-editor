import {
  useState, useRef, useEffect, useCallback,
} from 'react';
import { debounce } from 'lodash';
import * as logger from '../../../logger';

export const useVideoThumbnail = ({ currentMode, hasVideo, videoPreviewRef }) => {
  const [thumbnailData, setThumbnailData] = useState(null);
  const [hoverTime, setHoverTime] = useState(null);
  const [showHoverTime, setShowHoverTime] = useState(false);

  const thumbnailVideoRef = useRef(null);
  const thumbnailCanvasRef = useRef(null);

  useEffect(() => {
    if (currentMode === 'view' && hasVideo && !thumbnailVideoRef.current) {
      thumbnailVideoRef.current = document.createElement('video');
      thumbnailVideoRef.current.muted = true;
      thumbnailVideoRef.current.preload = 'metadata';
      thumbnailVideoRef.current.style.display = 'none';
      document.body.appendChild(thumbnailVideoRef.current);
    }

    return () => {
      if (thumbnailVideoRef.current) {
        thumbnailVideoRef.current.remove();
        thumbnailVideoRef.current = null;
      }
    };
  }, [currentMode, hasVideo]);

  const generateThumbnail = useCallback((time) => {
    if (!videoPreviewRef.current || !thumbnailVideoRef.current) { return; }

    const thumbnailVideo = thumbnailVideoRef.current;

    if (thumbnailVideo.src !== videoPreviewRef.current.src) {
      thumbnailVideo.src = videoPreviewRef.current.src;
    }

    if (!thumbnailCanvasRef.current) {
      thumbnailCanvasRef.current = document.createElement('canvas');
      thumbnailCanvasRef.current.width = 160;
      thumbnailCanvasRef.current.height = 90;
    }

    const canvas = thumbnailCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    thumbnailVideo.currentTime = time;

    const drawFrame = () => {
      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(thumbnailVideo, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setThumbnailData(dataUrl);
      } catch (err) {
        logger.error('Error generating thumbnail:', err);
      }
    };

    thumbnailVideo.onseeked = drawFrame;
  }, [videoPreviewRef]);

  const debouncedGenerateThumbnail = useCallback(
    debounce((time) => {
      if (videoPreviewRef.current && currentMode === 'view') {
        generateThumbnail(time);
      }
    }, 100),
    [generateThumbnail, currentMode],
  );

  const handleSeekHover = useCallback((e, seekBarRef, videoDuration) => {
    if (!seekBarRef.current || !videoDuration) { return; }

    const rect = seekBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = Math.max(0, Math.min(videoDuration, percent * videoDuration));

    setHoverTime(time);
    setShowHoverTime(true);
    debouncedGenerateThumbnail(time);
  }, [debouncedGenerateThumbnail]);

  const clearSeekHover = useCallback(() => {
    setShowHoverTime(false);
    setHoverTime(null);
    setThumbnailData(null);
  }, []);

  useEffect(() => () => {
    if (thumbnailCanvasRef.current) {
      const ctx = thumbnailCanvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, thumbnailCanvasRef.current.width, thumbnailCanvasRef.current.height);
    }
  }, []);

  return {
    thumbnailData,
    hoverTime,
    showHoverTime,
    handleSeekHover,
    clearSeekHover,
  };
};
