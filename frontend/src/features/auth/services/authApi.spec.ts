import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthApiService, type LoginCredentials, type AuthResponse } from './authApi';

// Mock the API_CONFIG
vi.mock('../../../shared/config/api.config', () => ({
  API_CONFIG: {
    AUTH_BASE_URL: 'http://localhost:3011',
    API_BASE_URL: 'http://localhost:3011',
    TIMEOUT: 30000,
    DEFAULT_HEADERS: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    ENDPOINTS: {
      AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        PROFILE: '/auth/profile',
      },
      CONFIG: {
        NETWORK_MAP: '/config/network-map',
        RULE: '/config/rule',
        TYPOLOGY: '/config/typology',
      },
    },
  },
}));

describe('AuthApiService', () => {
  let service: AuthApiService;

  beforeEach(() => {
    service = new AuthApiService();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(service).toBeInstanceOf(AuthApiService);
    });
  });

  describe('login', () => {
    it('should call fetch with correct URL and POST method', async () => {
      const mockResponse: AuthResponse = { message: 'Login successful', token: 'jwt-token' };
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const credentials: LoginCredentials = { username: 'test@example.com', password: 'pass123' };
      const result = await service.login(credentials);

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3011/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(credentials),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on 401 response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 401,
        ok: false,
        json: () => Promise.resolve({}),
      } as Response);

      await expect(service.login({ username: 'user', password: 'pass' })).rejects.toThrow(
        'Unauthorized - Token expired',
      );
    });

    it('should throw error on non-ok response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 500,
        ok: false,
        json: () => Promise.resolve({}),
      } as Response);

      await expect(service.login({ username: 'user', password: 'pass' })).rejects.toThrow(
        'HTTP error! status: 500',
      );
    });

    it('should throw Network error on TypeError', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(
        new TypeError('fetch failed'),
      );

      await expect(service.login({ username: 'user', password: 'pass' })).rejects.toThrow(
        'Network error',
      );
    });
  });

  describe('getProfile', () => {
    it('should call fetch with GET method and profile endpoint', async () => {
      const mockUser = { id: '1', username: 'test' };
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve(mockUser),
      } as Response);

      const result = await service.getProfile();

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3011/auth/profile',
        expect.objectContaining({
          method: 'GET',
        }),
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('decodeToken (static)', () => {
    it('should decode a valid JWT token and return User', () => {
      // Create a mock JWT: header.payload.signature
      const payload = {
        sub: 'user123',
        preferred_username: 'test@example.com',
        email: 'test@example.com',
        realm_access: { roles: ['editor'] },
        tenantId: 'tenant-1',
      };
      const base64Payload = btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;

      const user = AuthApiService.decodeToken(token);

      expect(user).not.toBeNull();
      expect(user!.id).toBe('user123');
      expect(user!.username).toBe('test@example.com');
      expect(user!.email).toBe('test@example.com');
    });

    it('should return null for invalid token', () => {
      const user = AuthApiService.decodeToken('invalid-token');
      expect(user).toBeNull();
    });

    it('should return null for empty string', () => {
      const user = AuthApiService.decodeToken('');
      expect(user).toBeNull();
    });

    it('should return null for token without payload', () => {
      const user = AuthApiService.decodeToken('headeronly');
      expect(user).toBeNull();
    });

    it('should handle token with clientId fallback', () => {
      const payload = { clientId: 'client-123' };
      const base64Payload = btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;

      const user = AuthApiService.decodeToken(token);
      expect(user).not.toBeNull();
      expect(user!.id).toBe('client-123');
    });

    it('should handle token with realm_access roles as claims', () => {
      const payload = {
        sub: 'user1',
        realm_access: { roles: ['editor', 'viewer'] },
      };
      const base64Payload = btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;

      const user = AuthApiService.decodeToken(token);
      expect(user).not.toBeNull();
      expect(user!.claims).toEqual(['editor', 'viewer']);
    });

    it('should handle token with inner tokenString', () => {
      const innerPayload = {
        sub: 'inner-user',
        preferred_username: 'inner@example.com',
      };
      const innerBase64 = btoa(JSON.stringify(innerPayload));
      const innerToken = `inner.${innerBase64}.sig`;

      const payload = { tokenString: innerToken };
      const base64Payload = btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;

      const user = AuthApiService.decodeToken(token);
      expect(user).not.toBeNull();
      expect(user!.id).toBe('inner-user');
    });

    it('should fallback to "unknown" id when no sub or clientId', () => {
      const payload = { preferred_username: 'test' };
      const base64Payload = btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;

      const user = AuthApiService.decodeToken(token);
      expect(user).not.toBeNull();
      expect(user!.id).toBe('unknown');
    });

    it('should fallback to sub as username when no preferred_username or username', () => {
      const payload = { sub: 'user123' };
      const base64Payload = btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;

      const user = AuthApiService.decodeToken(token);
      expect(user).not.toBeNull();
      expect(user!.username).toBe('user123');
    });

    it('should fallback to "user" username when no sub, preferred_username or username', () => {
      const payload = { clientId: 'client-1' };
      const base64Payload = btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;

      const user = AuthApiService.decodeToken(token);
      expect(user).not.toBeNull();
      expect(user!.username).toBe('user');
    });
  });
});
