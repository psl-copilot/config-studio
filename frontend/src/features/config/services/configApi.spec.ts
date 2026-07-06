import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConfigApiService, type PaginationParams, type PaginatedResponse } from './configApi';

vi.mock('../../../shared/config/api.config', () => ({
  API_CONFIG: {
    API_BASE_URL: 'http://localhost:3011',
    AUTH_BASE_URL: 'http://localhost:3011',
    TIMEOUT: 30000,
    DEFAULT_HEADERS: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    ENDPOINTS: {
      AUTH: { LOGIN: '/auth/login', LOGOUT: '/auth/logout', PROFILE: '/auth/profile' },
      CONFIG: {
        NETWORK_MAP: '/config/network-map',
        RULE: '/config/rule',
        TYPOLOGY: '/config/typology',
      },
    },
  },
}));

describe('ConfigApiService', () => {
  let service: ConfigApiService;

  beforeEach(() => {
    service = new ConfigApiService();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(service).toBeInstanceOf(ConfigApiService);
    });
  });

  describe('list', () => {
    const params: PaginationParams = { limit: 20, offset: 0 };

    it('should call fetch with GET and correct URL for network_map', async () => {
      const mockResp: PaginatedResponse<unknown> = {
        data: [{ id: '1' }],
        meta: { total: 1, limit: 20, offset: 0 },
      };
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve(mockResp),
      } as Response);

      const result = await service.list('network_map', params);

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:3011/config/network-map'),
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toEqual(mockResp);
    });

    it('should build query string with limit, offset, sort, order', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ data: [], meta: { total: 0, limit: 20, offset: 0 } }),
      } as Response);

      await service.list('rule', { limit: 10, offset: 20, sort: 'id', order: 'DESC' });

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain('limit=10');
      expect(url).toContain('offset=20');
      expect(url).toContain('sort=id');
      expect(url).toContain('order=DESC');
    });

    it('should include filters as JSON in query string', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ data: [], meta: { total: 0, limit: 20, offset: 0 } }),
      } as Response);

      await service.list('typology', { limit: 20, offset: 0, filters: { active: 'true' } });

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain('filters=');
    });

    it('should throw on 401 response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 401,
        ok: false,
        json: () => Promise.resolve({}),
      } as Response);

      await expect(service.list('rule', params)).rejects.toThrow('Session expired');
    });

    it('should throw on non-ok response with error message', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 500,
        ok: false,
        json: () => Promise.resolve({ message: 'Server error' }),
      } as Response);

      await expect(service.list('rule', params)).rejects.toThrow('Server error');
    });

    it('should throw generic error on non-ok response without message', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 404,
        ok: false,
        json: () => Promise.resolve({}),
      } as Response);

      await expect(service.list('rule', params)).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe('getById', () => {
    it('should call fetch with GET and correct URL including id and cfg', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ id: 'test' }),
      } as Response);

      await service.getById('rule', 'rule-1', '1.0.0');

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain('/config/rule/rule-1/1.0.0');
    });

    it('should URL-encode special characters', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      await service.getById('typology', 'id with space', 'cfg/special');

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain(encodeURIComponent('id with space'));
      expect(url).toContain(encodeURIComponent('cfg/special'));
    });
  });

  describe('create', () => {
    it('should call fetch with POST and body', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 201,
        ok: true,
        json: () => Promise.resolve({ created: true }),
      } as Response);

      const body = { name: 'test' };
      await service.create('network_map', body);

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/config/network-map'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        }),
      );
    });
  });

  describe('update', () => {
    it('should call fetch with PUT and body', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ updated: true }),
      } as Response);

      const body = { name: 'updated' };
      await service.update('rule', 'rule-1', '1.0.0', body);

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/config/rule/rule-1/1.0.0'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(body),
        }),
      );
    });
  });

  describe('delete', () => {
    it('should call fetch with DELETE', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      await service.delete('typology', 'typo-1', '2.0.0');

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/config/typology/typo-1/2.0.0'),
        expect.objectContaining({ method: 'DELETE' }),
      );
    });

    it('should throw on 401 response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 401,
        ok: false,
        json: () => Promise.resolve({}),
      } as Response);

      await expect(service.delete('rule', 'r1', '1.0')).rejects.toThrow('Session expired');
    });

    it('should throw on non-ok response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 500,
        ok: false,
        json: () => Promise.resolve({ message: 'Delete failed' }),
      } as Response);

      await expect(service.delete('rule', 'r1', '1.0')).rejects.toThrow('Delete failed');
    });
  });

  describe('getAuthHeaders (static, tested via requests)', () => {
    it('should include Authorization header when token is in localStorage', async () => {
      localStorage.setItem('authToken', 'my-token');
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ data: [], meta: { total: 0, limit: 20, offset: 0 } }),
      } as Response);

      await service.list('rule', { limit: 20, offset: 0 });

      const init = fetchSpy.mock.calls[0][1] as RequestInit;
      const headers = init.headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Bearer my-token');
    });
  });
});
