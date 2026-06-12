import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $authState, initializeAuth } from '../stores/authStore';
import KardexApp from './KardexApp';

export default function AppWrapper() {
  const authState = useStore($authState);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    // Initialize auth on mount
    initializeAuth().finally(() => setIsCheckingSession(false));
  }, []);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isCheckingSession && !authState.isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isCheckingSession, authState.isAuthenticated]);

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-[#141414] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return null;
  }

  return <KardexApp />;
}
