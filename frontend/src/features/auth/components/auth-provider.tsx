'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { login as loginRequest, register as registerRequest } from '../api/auth.api';
import { AuthSession, LoginInput, RegisterInput, UserProfile } from '../types/auth.types';

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (input: LoginInput) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function storeSession(session: AuthSession): void {
  window.localStorage.setItem('saku.accessToken', session.access_token);
  window.localStorage.setItem('saku.user', JSON.stringify(session.user));
}

function readStoredUser(): UserProfile | null {
  const rawUser = window.localStorage.getItem('saku.user');
  if (!rawUser) return null;
  try {
    return JSON.parse(rawUser) as UserProfile;
  } catch {
    window.localStorage.removeItem('saku.user');
    window.localStorage.removeItem('saku.accessToken');
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(window.localStorage.getItem('saku.accessToken') ? readStoredUser() : null);
    setIsLoading(false);

    const handleUnauthorized = () => setUser(null);
    window.addEventListener('saku:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('saku:unauthorized', handleUnauthorized);
  }, []);

  const signIn = useCallback(async (input: LoginInput) => {
    const session = await loginRequest(input);
    storeSession(session);
    setUser(session.user);
  }, []);

  const signUp = useCallback(async (input: RegisterInput) => {
    const session = await registerRequest(input);
    storeSession(session);
    setUser(session.user);
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem('saku.accessToken');
    window.localStorage.removeItem('saku.user');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, signIn, signUp, signOut }),
    [user, isLoading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
