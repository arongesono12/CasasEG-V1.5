import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { PropertyProvider } from './contexts/PropertyContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { AppRouter } from './navigation/AppRouter';

import { ConnectivityHandler } from './components/ConnectivityHandler';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <ConnectivityHandler>
        <AuthProvider>
          <PropertyProvider>
            <MessagingProvider>
              <AppRouter />
            </MessagingProvider>
          </PropertyProvider>
        </AuthProvider>
      </ConnectivityHandler>
    </ErrorBoundary>
  );
}
