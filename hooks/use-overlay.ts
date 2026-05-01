import { useState, useCallback } from 'react';
import { NativeModules, Platform } from 'react-native';

const { OverlayWindow } = NativeModules;

export function useOverlay() {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startOverlay = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setError('Overlay only available on Android');
      return;
    }

    try {
      const result = await OverlayWindow.startOverlay();
      console.log('Overlay started:', result);
      setIsActive(true);
      setError(null);
    } catch (err: any) {
      const message = err.message || 'Failed to start overlay';
      console.error('Error starting overlay:', message);
      setError(message);
    }
  }, []);

  const stopOverlay = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      const result = await OverlayWindow.stopOverlay();
      console.log('Overlay stopped:', result);
      setIsActive(false);
      setError(null);
    } catch (err: any) {
      const message = err.message || 'Failed to stop overlay';
      console.error('Error stopping overlay:', message);
      setError(message);
    }
  }, []);

  const updatePosition = useCallback(
    async (x: number, y: number) => {
      if (Platform.OS !== 'android' || !isActive) {
        return;
      }

      try {
        await OverlayWindow.updateOverlayPosition(x, y);
      } catch (err: any) {
        console.error('Error updating position:', err.message);
      }
    },
    [isActive]
  );

  return {
    isActive,
    error,
    startOverlay,
    stopOverlay,
    updatePosition,
  };
}
