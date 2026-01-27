import React, { useState, useEffect } from 'react';
import { ErrorState } from './ui/ErrorState';

interface ConnectivityHandlerProps {
  children: React.ReactNode;
}

export const ConnectivityHandler: React.FC<ConnectivityHandlerProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleRateLimit = () => {
        setIsRateLimited(true);
        setTimeout(() => setIsRateLimited(false), 30000); // Reset after 30s
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('app:rate-limit', handleRateLimit);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('app:rate-limit', handleRateLimit);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center animate-fade-in">
        <ErrorState 
          type="offline" 
          showHome={false}
        />
      </div>
    );
  }

  if (isRateLimited) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center animate-fade-in">
        <ErrorState 
          type="limit" 
          onAction={() => setIsRateLimited(false)}
          actionLabel="Intentar de nuevo"
        />
      </div>
    );
  }

  return <>{children}</>;
};
