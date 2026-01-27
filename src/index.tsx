import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { PropertyProvider } from './contexts/PropertyContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PropertyProvider>
            <MessagingProvider>
              <App />
            </MessagingProvider>
          </PropertyProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

