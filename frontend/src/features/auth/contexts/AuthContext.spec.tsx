import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

// Mock the authApi module
vi.mock('../services/authApi', () => ({
  authApi: {
    login: vi.fn(),
  },
  AuthApiService: {
    decodeToken: vi.fn(),
  },
}));

import { authApi, AuthApiService } from '../services/authApi';

// Helper component to consume auth context
const TestConsumer = ({ onState }: { onState: (state: ReturnType<typeof useAuth>) => void }) => {
  const auth = useAuth();
  onState(auth);
  return null;
};

const renderWithProvider = (onState: (state: ReturnType<typeof useAuth>) => void) => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <TestConsumer onState={onState} />
      </AuthProvider>
    </MemoryRouter>,
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('AuthProvider - initial state', () => {
    it('should provide isAuthenticated as false initially', async () => {
      let authState: ReturnType<typeof useAuth> | null = null;
      renderWithProvider((auth) => {
        authState = auth;
      });

      await waitFor(() => {
        expect(authState!.loading).toBe(false);
      });

      expect(authState!.isAuthenticated).toBe(false);
    });

    it('should provide user as null initially', async () => {
      let authState: ReturnType<typeof useAuth> | null = null;
      renderWithProvider((auth) => {
        authState = auth;
      });

      await waitFor(() => {
        expect(authState!.loading).toBe(false);
      });

      expect(authState!.user).toBeNull();
    });

    it('should set loading to false after initialization', async () => {
      let authState: ReturnType<typeof useAuth> | null = null;
      renderWithProvider((auth) => {
        authState = auth;
      });

      await waitFor(() => {
        expect(authState!.loading).toBe(false);
      });
    });
  });

  describe('AuthProvider - localStorage initialization', () => {
    it('should restore auth state from localStorage on mount', async () => {
      const mockUser = { id: '1', username: 'test@example.com' };
      localStorage.setItem('authToken', 'valid-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      (AuthApiService.decodeToken as ReturnType<typeof vi.fn>).mockReturnValue(mockUser);

      let authState: ReturnType<typeof useAuth> | null = null;
      renderWithProvider((auth) => {
        authState = auth;
      });

      await waitFor(() => {
        expect(authState!.isAuthenticated).toBe(true);
      });

      expect(authState!.user).toEqual(mockUser);
    });

    it('should clear localStorage if token decode fails', async () => {
      localStorage.setItem('authToken', 'invalid-token');
      localStorage.setItem('user', JSON.stringify({ id: '1' }));
      (AuthApiService.decodeToken as ReturnType<typeof vi.fn>).mockReturnValue(null);

      let authState: ReturnType<typeof useAuth> | null = null;
      renderWithProvider((auth) => {
        authState = auth;
      });

      await waitFor(() => {
        expect(authState!.loading).toBe(false);
      });

      expect(authState!.isAuthenticated).toBe(false);
      expect(authState!.user).toBeNull();
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('should clear localStorage if JSON parse fails', async () => {
      localStorage.setItem('authToken', 'valid-token');
      localStorage.setItem('user', 'invalid-json');
      (AuthApiService.decodeToken as ReturnType<typeof vi.fn>).mockReturnValue({ id: '1' });

      let authState: ReturnType<typeof useAuth> | null = null;
      renderWithProvider((auth) => {
        authState = auth;
      });

      await waitFor(() => {
        expect(authState!.loading).toBe(false);
      });

      expect(authState!.isAuthenticated).toBe(false);
      expect(localStorage.getItem('authToken')).toBeNull();
    });

    it('should not restore when only token exists without user', async () => {
      localStorage.setItem('authToken', 'valid-token');
      // No user in localStorage

      let authState: ReturnType<typeof useAuth> | null = null;
      renderWithProvider((auth) => {
        authState = auth;
      });

      await waitFor(() => {
        expect(authState!.loading).toBe(false);
      });

      expect(authState!.isAuthenticated).toBe(false);
    });
  });

  describe('AuthProvider - login', () => {
    it('should set authenticated on successful login', async () => {
      const mockUser = { id: '1', username: 'test@example.com' };
      (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue({
        message: 'Login successful',
        token: 'jwt-token',
      });
      (AuthApiService.decodeToken as ReturnType<typeof vi.fn>).mockReturnValue(mockUser);

      let authState: ReturnType<typeof useAuth> | null = null;
      renderWithProvider((auth) => {
        authState = auth;
      });

      // Wait for initial loading to finish
      await waitFor(() => {
        expect(authState!.loading).toBe(false);
      });

      const result = await authState!.login('test@example.com', 'password');

      expect(result).toBe(true);
      await waitFor(() => {
        expect(authState!.isAuthenticated).toBe(true);
      });
      expect(authState!.user).toEqual(mockUser);
      expect(localStorage.getItem('authToken')).toBe('jwt-token');
    });

    it('should return false on login with no token in response', async () => {
      (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue({
        message: 'Login failed',
        token: '',
      });

      let authState: ReturnType<typeof useAuth> | null = null;
      renderWithProvider((auth) => {
        authState = auth;
      });

      await waitFor(() => {
        expect(authState!.loading).toBe(false);
      });

      const result = await authState!.login('user', 'pass');

      expect(result).toBe(false);
      expect(authState!.isAuthenticated).toBe(false);
    });

    it('should return false when decodeToken returns null', async () => {
      (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue({
        message: 'Login successful',
        token: 'jwt-token',
      });
      (AuthApiService.decodeToken as ReturnType<typeof vi.fn>).mockReturnValue(null);

      let authState: ReturnType<typeof useAuth> | null = null;
      renderWithProvider((auth) => {
        authState = auth;
      });

      await waitFor(() => {
        expect(authState!.loading).toBe(false);
      });

      const result = await authState!.login('user', 'pass');

      expect(result).toBe(false);
    });

    it('should clear existing auth state before login attempt', async () => {
      const mockUser = { id: '1', username: 'test@example.com' };
      localStorage.setItem('authToken', 'old-token');
      localStorage.setItem('user', JSON.stringify({ id: 'old' }));

      (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue({
        message: 'Login successful',
        token: 'new-token',
      });
      (AuthApiService.decodeToken as ReturnType<typeof vi.fn>).mockReturnValue(mockUser);

      let authState: ReturnType<typeof useAuth> | null = null;
      renderWithProvider((auth) => {
        authState = auth;
      });

      await waitFor(() => {
        expect(authState!.loading).toBe(false);
      });

      await authState!.login('test@example.com', 'password');

      expect(localStorage.getItem('authToken')).toBe('new-token');
    });
  });

  describe('AuthProvider - logout', () => {
    it('should clear auth state on logout', async () => {
      const mockUser = { id: '1', username: 'test@example.com' };
      localStorage.setItem('authToken', 'valid-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      (AuthApiService.decodeToken as ReturnType<typeof vi.fn>).mockReturnValue(mockUser);

      let authState: ReturnType<typeof useAuth> | null = null;
      renderWithProvider((auth) => {
        authState = auth;
      });

      await waitFor(() => {
        expect(authState!.isAuthenticated).toBe(true);
      });

      authState!.logout();

      await waitFor(() => {
        expect(authState!.isAuthenticated).toBe(false);
      });
      expect(authState!.user).toBeNull();
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('useAuth', () => {
    it('should return default context when used outside AuthProvider', () => {
      let authState: ReturnType<typeof useAuth> | null = null;
      render(<TestConsumer onState={(auth) => { authState = auth; }} />);
      expect(authState).not.toBeNull();
      expect(authState!.isAuthenticated).toBe(false);
      expect(authState!.user).toBeNull();
      expect(authState!.loading).toBe(false);
    });
  });
});
