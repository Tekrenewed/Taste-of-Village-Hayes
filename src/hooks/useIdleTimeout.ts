import { useEffect, useRef, useCallback } from 'react';

type IdleTimeoutProps = {
  onIdle: () => void;
  idleTime?: number; // in milliseconds
  isActive?: boolean; // toggle to enable/disable the hook
};

export const useIdleTimeout = ({ 
  onIdle, 
  idleTime = 180000, // Default 3 minutes
  isActive = true 
}: IdleTimeoutProps) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleIdle = useCallback(() => {
    onIdle();
  }, [onIdle]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (isActive) {
      timeoutRef.current = setTimeout(handleIdle, idleTime);
    }
  }, [handleIdle, idleTime, isActive]);

  useEffect(() => {
    if (!isActive) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const events = ['mousemove', 'keydown', 'wheel', 'DOMMouseScroll', 'mouseWheel', 'mousedown', 'touchstart', 'touchmove', 'MSPointerDown', 'MSPointerMove'];
    
    // Initial start
    resetTimer();

    // Attach listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer, isActive]);
};
