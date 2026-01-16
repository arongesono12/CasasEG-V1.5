import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { PropertyProvider } from './contexts/PropertyContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { AppRouter } from './navigation/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <PropertyProvider>
        <MessagingProvider>
          <AppRouter />
        </MessagingProvider>
      </PropertyProvider>
    </AuthProvider>
  );
}
