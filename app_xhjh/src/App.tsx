import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import appRouter from './router';
import { useAuthStore } from './store/authStore';
import { ToastProvider } from './components/Toast';

const App: React.FC = () => {
  const { clearAuth, refreshUserInfo, isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    const handleAuthExpired = () => {
      clearAuth();
    };

    window.addEventListener('auth-expired', handleAuthExpired);

    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, [clearAuth]);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      refreshUserInfo();
    }
  }, [isHydrated, isAuthenticated, refreshUserInfo]);

  return (
    <ToastProvider>
      <RouterProvider router={appRouter} />
    </ToastProvider>
  );
};

export default App;