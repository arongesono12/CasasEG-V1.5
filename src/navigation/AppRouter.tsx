import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { useAuth } from '../contexts/AuthContext';
import { AnimatePresence } from 'framer-motion';

// Lazy loaded components
const ProfileView = React.lazy(() => import('../components/profile/ProfileView').then(module => ({ default: module.ProfileView })));
const AdminDashboard = React.lazy(() => import('../components/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const PropertyDetailsView = React.lazy(() => import('../components/property/PropertyDetailsView').then(module => ({ default: module.PropertyDetailsView })));

// Loading component
const LoadingScreen = () => (
  <div className="flex h-screen items-center justify-center bg-white">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-12 w-12 bg-black rounded-full mb-4"></div>
      <p className="text-gray-500 font-medium">Cargando CasasEG...</p>
    </div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>

        <Route path="/" element={<HomePage />} />
        
        <Route 
          path="/property/:id" 
          element={
            <PropertyDetailsView 
              property={null as any} // The component should handle fetching or getting from context
              onBack={() => window.history.back()} 
              currentUser={currentUser}
              onAction={() => {}} // Placeholder or handle specifically
            />
          } 
        />

        <Route 
          path="/profile" 
          element={currentUser ? <ProfileView onBack={() => window.history.back()} onAdminClick={() => {}} /> : <Navigate to="/" />} 
        />
        
        <Route 
          path="/admin" 
          element={currentUser?.role === 'admin' ? <AdminDashboard onBack={() => window.history.back()} /> : <Navigate to="/" />} 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};


export function AppRouter() {
  return (
    <Router>
      <React.Suspense fallback={<LoadingScreen />}>
        <AnimatedRoutes />
      </React.Suspense>
    </Router>
  );
}

