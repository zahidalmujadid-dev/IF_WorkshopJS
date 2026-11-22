import { apiRequest } from '@/lib/api-client';
import { AuthSession, LoginInput, RegisterInput } from '../types/auth.types';

export const login = (input: LoginInput): Promise<AuthSession> =>
  apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    authenticated: false,
    body: JSON.stringify(input),
  });

export const register = (input: RegisterInput): Promise<AuthSession> =>
  apiRequest<AuthSession>('/auth/register', {
    method: 'POST',
    authenticated: false,
    body: JSON.stringify(input),
  });
