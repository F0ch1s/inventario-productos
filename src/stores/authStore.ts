import { atom, computed } from 'nanostores';
import { supabase } from '../lib/supabaseClient';

export interface User {
  id: string;
  email: string;
  username?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

export const $authState = atom<AuthState>(initialState);

/**
 * Initialize auth state by checking for existing session
 */
export async function initializeAuth() {
  try {
    const { data } = await supabase.auth.getSession();
    
    if (data.session?.user) {
      const user: User = {
        id: data.session.user.id,
        email: data.session.user.email || '',
        username: data.session.user.user_metadata?.username,
      };
      
      $authState.set({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } else {
      $authState.set({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    }
  } catch (error) {
    $authState.set({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: 'Error al verificar sesión',
    });
  }
}

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string, username?: string): Promise<boolean> {
  try {
    $authState.set({ ...$authState.get(), isLoading: true, error: null });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
        },
      },
    });

    if (error) {
      $authState.set({
        ...$authState.get(),
        isLoading: false,
        error: error.message,
      });
      return false;
    }

    if (data.user) {
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        username: data.user.user_metadata?.username,
      };

      $authState.set({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
      return true;
    }

    return false;
  } catch (error) {
    $authState.set({
      ...$authState.get(),
      isLoading: false,
      error: 'Error al registrarse',
    });
    return false;
  }
}

/**
 * Sign in user
 */
export async function signIn(email: string, password: string): Promise<boolean> {
  try {
    $authState.set({ ...$authState.get(), isLoading: true, error: null });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      $authState.set({
        ...$authState.get(),
        isLoading: false,
        error: error.message,
      });
      return false;
    }

    if (data.user) {
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        username: data.user.user_metadata?.username,
      };

      $authState.set({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
      return true;
    }

    return false;
  } catch (error) {
    $authState.set({
      ...$authState.get(),
      isLoading: false,
      error: 'Error al iniciar sesión',
    });
    return false;
  }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      $authState.set({
        ...$authState.get(),
        error: error.message,
      });
      return false;
    }

    $authState.set({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
    return true;
  } catch (error) {
    $authState.set({
      ...$authState.get(),
      error: 'Error al cerrar sesión',
    });
    return false;
  }
}

/**
 * Computed store for easy access to authentication state
 */
export const $isAuthenticated = computed($authState, (state) => state.isAuthenticated);
export const $currentUser = computed($authState, (state) => state.user);
export const $authLoading = computed($authState, (state) => state.isLoading);
