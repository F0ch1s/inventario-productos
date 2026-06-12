import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from '../stores/authStore';

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    const success = await signOut();
    setIsLoading(false);
    
    if (success) {
      window.location.href = '/login';
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-auto mb-4 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      title="Cerrar sesión"
    >
      <LogOut size={18} />
      <span className="hidden md:inline">Cerrar Sesión</span>
    </button>
  );
}
