import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { signIn, signUp, $authState } from '../stores/authStore';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

export default function LoginForm() {
  const authState = useStore($authState);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated
    if (authState.isAuthenticated && !authState.isLoading) {
      window.location.href = '/';
    }
  }, [authState.isAuthenticated, authState.isLoading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    const success = await signIn(email, password);
    setIsSubmitting(false);

    if (success) {
      window.location.href = '/';
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) return;

    setIsSubmitting(true);
    const success = await signUp(email, password, username);
    setIsSubmitting(false);

    if (success) {
      window.location.href = '/';
    }
  };

  const handleSubmit = mode === 'login' ? handleLogin : handleSignUp;

  const handleDemoLogin = async () => {
    setMode('login');
    setEmail('demo@example.com');
    setPassword('demo123456');

    setIsSubmitting(true);
    let success = await signIn('demo@example.com', 'demo123456');

    if (!success) {
      success = await signUp('demo@example.com', 'demo123456', 'Demo');
    }

    if (success) {
      success = await signIn('demo@example.com', 'demo123456');
    }

    setIsSubmitting(false);

    if (success) {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-[#141414]/10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#141414] rounded-lg flex items-center justify-center mx-auto mb-4">
              <div className="text-white text-2xl font-bold">📊</div>
            </div>
            <h1 className="text-3xl font-bold text-[#141414] font-serif italic">
              Sistema de Inventario
            </h1>
            <p className="text-slate-600 text-sm mt-2">
              Gestión integral de productos y movimientos
            </p>
          </div>

          {/* Error Message */}
          {authState.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-red-700">{authState.error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre de usuario"
                  className="w-full px-4 py-2 border border-[#141414] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#141414] focus:ring-offset-2"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-2 border border-[#141414] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#141414] focus:ring-offset-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-[#141414] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#141414] focus:ring-offset-2"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || authState.isLoading}
              className="w-full bg-[#141414] text-white py-3 rounded-lg font-semibold hover:bg-[#141414]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {isSubmitting || authState.isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === 'login' ? 'Iniciando sesión...' : 'Registrando...'}
                </>
              ) : (
                <>
                  {mode === 'login' ? (
                    <>
                      <LogIn size={18} />
                      Iniciar Sesión
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Registrarse
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="text-center">
            <p className="text-sm text-slate-600">
              {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setEmail('');
                  setPassword('');
                  setUsername('');
                }}
                className="ml-2 font-semibold text-[#141414] hover:underline"
              >
                {mode === 'login' ? 'Registrarse aquí' : 'Iniciar sesión'}
              </button>
            </p>
          </div>

          {/* Demo Credentials */}
          {mode === 'login' && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center mb-2">
                Demo: Usa cualquier email y contraseña
              </p>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full text-xs py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Llenar demo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
