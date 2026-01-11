import { useState, useCallback } from 'react';
import { APP_CONFIG } from '../constants/config';

export const useToast = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), APP_CONFIG.TOAST_DURATION);
  }, []);

  return { toastMessage, showToast };
};

