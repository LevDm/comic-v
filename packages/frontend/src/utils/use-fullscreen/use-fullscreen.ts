import { useEffect, useState } from 'react';

export const useFullscreen = (): [boolean | null, () => void] => {
  //if (typeof window !== "undefined") {
  const [isFullscreen, setIsFullscreen] = useState<boolean | null>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const fullscreenChangeHandler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', fullscreenChangeHandler);
    if (isFullscreen === null) {
      setIsFullscreen(!!document.fullscreenElement);
    }
    return () => {
      document.removeEventListener('fullscreenchange', fullscreenChangeHandler);
    };
  }, []);

  return [isFullscreen, toggleFullscreen];
};
