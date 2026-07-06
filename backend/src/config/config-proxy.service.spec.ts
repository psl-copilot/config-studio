import { ConfigProxyService, type ConfigTable } from './config-proxy.service';
import { AdminServiceClient } from '../services/admin-service-client.service';

describe('ConfigProxyService', () => {
  let service: ConfigProxyService;
  let adminServiceClient: AdminServiceClient;

  const mockAdminServiceClient = {
    executeHttpRequest: jest.fn(),
  };

  beforeEach(() => {
    service = new ConfigProxyService(mockAdminServiceClient as unknown as AdminServiceClient);
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should call executeHttpRequest with GET and correct path', async () => {
      mockAdminServiceClient.executeHttpRequest.mockResolvedValue({ data: [] });

      await service.list('network_map', 'token', { limit: '10', offset: '0' });

      expect(mockAdminServiceClient.executeHttpRequest).toHaveBeenCalledWith(
        'GET',
        '/v1/admin/configuration/network_map?limit=10&offset=0',
        'token',
      );
    });

    it('should build query string with sort and order', async () => {
      mockAdminServiceClient.executeHttpRequest.mockResolvedValue({ data: [] });

      await service.list('rule', 'token', { limit: '20', offset: '0', sort: 'id', order: 'ASC' });

      const call = mockAdminServiceClient.executeHttpRequest.mock.calls[0];
      expect(call[0]).toBe('GET');
      expect(call[1]).toContain('limit=20');
      expect(call[1]).toContain('sort=id');
      expect(call[1]).toContain('order=ASC');
    });

    it('should return empty query string when no query params', async () => {
      mockAdminServiceClient.executeHttpRequest.mockResolvedValue({ data: [] });

      await service.list('typology', 'token', {});

      expect(mockAdminServiceClient.executeHttpRequest).toHaveBeenCalledWith(
        'GET',
        '/v1/admin/configuration/typology',
        'token',
      );
    });

    it('should skip undefined and empty values in query string', async () => {
      mockAdminServiceClient.executeHttpRequest.mockResolvedValue({ data: [] });

      await service.list('rule', 'token', { limit: '10', offset: undefined, sort: '', order: 'DESC' });

      const call = mockAdminServiceClient.executeHttpRequest.mock.calls[0];
      expect(call[1]).toContain('limit=10');
      expect(call[1]).toContain('order=DESC');
      expect(call[1]).not.toContain('offset');
      expect(call[1]).not.toContain('sort');
    });
  });

  describe('getById', () => {
    it('should call executeHttpRequest with GET and correct path including id and cfg', async () => {
      mockAdminServiceClient.executeHttpRequest.mockResolvedValue({ id: 'test' });

      await service.getById('rule', 'rule-1', '1.0.0', 'token');

      expect(mockAdminServiceClient.executeHttpRequest).toHaveBeenCalledWith(
        'GET',
        '/v1/admin/configuration/rule/rule-1/1.0.0',
        'token',
      );
    });

    it('should URL-encode special characters in id and cfg', async () => {
      mockAdminServiceClient.executeHttpRequest.mockResolvedValue({});

      await service.getById('typology', 'id with spaces', 'cfg/special', 'token');

      const call = mockAdminServiceClient.executeHttpRequest.mock.calls[0];
      expect(call[1]).toContain(encodeURIComponent('id with spaces'));
      expect(call[1]).toContain(encodeURIComponent('cfg/special'));
    });
  });

  describe('create', () => {
    it('should call executeHttpRequest with POST and body', async () => {
      const body = { name: 'test', cfg: '1.0.0' };
      mockAdminServiceClient.executeHttpRequest.mockResolvedValue({ created: true });

      await service.create('network_map', body, 'token');

      expect(mockAdminServiceClient.executeHttpRequest).toHaveBeenCalledWith(
        'POST',
        '/v1/admin/configuration/network_map',
        'token',
        body,
      );
    });
  });

  describe('update', () => {
    it('should call executeHttpRequest with PUT, path, and body', async () => {
      const body = { name: 'updated' };
      mockAdminServiceClient.executeHttpRequest.mockResolvedValue({ updated: true });

      await service.update('rule', 'rule-1', '1.0.0', body, 'token');

      expect(mockAdminServiceClient.executeHttpRequest).toHaveBeenCalledWith(
        'PUT',
        '/v1/admin/configuration/rule/rule-1/1.0.0',
        'token',
        body,
      );
    });

    it('should URL-encode id and cfg in update path', async () => {
      mockAdminServiceClient.executeHttpRequest.mockResolvedValue({});

      await service.update('typology', 'id#1', 'cfg@2', {}, 'token');

      const call = mockAdminServiceClient.executeHttpRequest.mock.calls[0];
      expect(call[1]).toContain(encodeURIComponent('id#1'));
      expect(call[1]).toContain(encodeURIComponent('cfg@2'));
    });
  });

  describe('delete', () => {
    it('should call executeHttpRequest with DELETE and correct path', async () => {
      mockAdminServiceClient.executeHttpRequest.mockResolvedValue({});

      await service.delete('network_map', 'map-1', '2.0.0', 'token');

      expect(mockAdminServiceClient.executeHttpRequest).toHaveBeenCalledWith(
        'DELETE',
        '/v1/admin/configuration/network_map/map-1/2.0.0',
        'token',
      );
    });
  });

  describe('buildQueryString (private, tested via list)', () => {
    it('should handle filters as JSON string', async () => {
      mockAdminServiceClient.executeHttpRequest.mockResolvedValue({});

      await service.list('rule', 'token', {
        limit: '10',
        offset: '0',
        filters: '{"active":true}',
      });

      const call = mockAdminServiceClient.executeHttpRequest.mock.calls[0];
      expect(call[1]).toContain('filters=');
    });

    it('should handle all query params together', async () => {
      mockAdminServiceClient.executeHttpRequest.mockResolvedValue({});

      await service.list('network_map', 'token', {
        limit: '50',
        offset: '100',
        sort: 'name',
        order: 'DESC',
        filters: '{"active":true}',
      });

      const call = mockAdminServiceClient.executeHttpRequest.mock.calls[0];
      expect(call[1]).toContain('limit=50');
      expect(call[1]).toContain('offset=100');
      expect(call[1]).toContain('sort=name');
      expect(call[1]).toContain('order=DESC');
      expect(call[1]).toContain('filters=');
    });

    it('should handle undefined values in query', async () => {
      mockAdminServiceClient.executeHttpRequest.mockResolvedValue({});

      await service.list('typology', 'token', {
        limit: undefined,
        offset: undefined,
        sort: undefined,
        order: undefined,
        filters: undefined,
      });

      expect(mockAdminServiceClient.executeHttpRequest).toHaveBeenCalledWith(
        'GET',
        '/v1/admin/configuration/typology',
        'token',
      );
    });
  });

  describe('all table types', () => {
    it('should work with network_map table', async () => {
      mockAdminServiceClient.executeHttpRequest.mockResolvedValue({});
      await service.list('network_map', 'token', {});
      expect(mockAdminServiceClient.executeHttpRequest).toHaveBeenCalled();
    });

    it('should work with rule table', async () => {
      mockAdminServiceClient.executeHttpRequest.mockResolvedValue({});
      await service.list('rule', 'token', {});
      expect(mockAdminServiceClient.executeHttpRequest).toHaveBeenCalled();
    });

    it('should work with typology table', async () => {
      mockAdminServiceClient.executeHttpRequest.mockResolvedValue({});
      await service.list('typology', 'token', {});
      expect(mockAdminServiceClient.executeHttpRequest).toHaveBeenCalled();
    });
  });
});
