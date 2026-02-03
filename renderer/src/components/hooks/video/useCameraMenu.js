import { useState, useRef, useEffect } from 'react';

export const useCameraMenu = () => {
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const cameraMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cameraMenuRef.current && !cameraMenuRef.current.contains(event.target)) {
        setShowCameraMenu(false);
      }
    };

    if (showCameraMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCameraMenu]);

  return {
    showCameraMenu,
    setShowCameraMenu,
    cameraMenuRef,
  };
};
