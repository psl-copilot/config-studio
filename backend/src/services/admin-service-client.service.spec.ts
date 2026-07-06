import { Test, type TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AdminServiceClient } from './admin-service-client.service';

describe('AdminServiceClient', () => {
  let client: AdminServiceClient;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    axiosRef: {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://admin:5100'),
  };

  beforeEach(async () => {
    // Set the mock BEFORE creating the module since the constructor reads it
    mockConfigService.get.mockReturnValue('http://admin:5100');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminServiceClient,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    client = module.get<AdminServiceClient>(AdminServiceClient);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);

    // Clear mock calls but preserve implementations
    mockHttpService.get.mockClear();
    mockHttpService.post.mockClear();
    mockHttpService.put.mockClear();
    mockHttpService.delete.mockClear();
  });

  describe('constructor', () => {
    it('should use ADMIN_SERVICE_URL from config', () => {
      mockConfigService.get.mockReturnValue('http://custom-admin:5100');
      const c = new AdminServiceClient(mockHttpService as any, mockConfigService as any);
      expect(c).toBeDefined();
    });

    it('should fallback to localhost:5100 when ADMIN_SERVICE_URL is not set', async () => {
      mockConfigService.get.mockReturnValue(undefined);
      const c = new AdminServiceClient(mockHttpService as any, mockConfigService as any);

      // Verify it uses the fallback URL
      mockHttpService.get.mockReturnValue(of({ data: {}, status: 200 }));
      await c.executeHttpRequest('GET', '/test', 'token');

      expect(mockHttpService.get).toHaveBeenCalledWith(
        'http://localhost:5100/test',
        { headers: { Authorization: 'Bearer token' } },
      );
    });

    it('should fallback to localhost:5100 when ADMIN_SERVICE_URL is null', async () => {
      mockConfigService.get.mockReturnValue(null);
      const c = new AdminServiceClient(mockHttpService as any, mockConfigService as any);

      mockHttpService.get.mockReturnValue(of({ data: {}, status: 200 }));
      await c.executeHttpRequest('GET', '/test', 'token');

      expect(mockHttpService.get).toHaveBeenCalledWith(
        'http://localhost:5100/test',
        { headers: { Authorization: 'Bearer token' } },
      );
    });
  });

  describe('executeHttpRequest - GET', () => {
    it('should make GET request and return response data', async () => {
      mockConfigService.get.mockReturnValue('http://admin:5100');
      mockHttpService.get.mockReturnValue(
        of({ data: { result: 'success' }, status: 200 }),
      );

      const result = await client.executeHttpRequest('GET', '/test', 'token');

      expect(result).toEqual({ result: 'success' });
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'http://admin:5100/test',
        { headers: { Authorization: 'Bearer token' } },
      );
    });

    it('should not add Bearer prefix if token already has it', async () => {
      mockConfigService.get.mockReturnValue('http://admin:5100');
      mockHttpService.get.mockReturnValue(
        of({ data: {}, status: 200 }),
      );

      await client.executeHttpRequest('GET', '/test', 'Bearer existing-token');

      expect(mockHttpService.get).toHaveBeenCalledWith(
        'http://admin:5100/test',
        { headers: { Authorization: 'Bearer existing-token' } },
      );
    });
  });

  describe('executeHttpRequest - POST', () => {
    it('should make POST request with body and return response data', async () => {
      mockConfigService.get.mockReturnValue('http://admin:5100');
      mockHttpService.post.mockReturnValue(
        of({ data: { id: 1 }, status: 201 }),
      );

      const result = await client.executeHttpRequest('POST', '/create', 'token', { name: 'test' });

      expect(result).toEqual({ id: 1 });
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'http://admin:5100/create',
        { name: 'test' },
        { headers: { Authorization: 'Bearer token' } },
      );
    });
  });

  describe('executeHttpRequest - PUT', () => {
    it('should make PUT request with body and return response data', async () => {
      mockConfigService.get.mockReturnValue('http://admin:5100');
      mockHttpService.put.mockReturnValue(
        of({ data: { updated: true }, status: 200 }),
      );

      const result = await client.executeHttpRequest('PUT', '/update/1', 'token', { name: 'updated' });

      expect(result).toEqual({ updated: true });
      expect(mockHttpService.put).toHaveBeenCalledWith(
        'http://admin:5100/update/1',
        { name: 'updated' },
        { headers: { Authorization: 'Bearer token' } },
      );
    });
  });

  describe('executeHttpRequest - DELETE', () => {
    it('should make DELETE request and return response data', async () => {
      mockConfigService.get.mockReturnValue('http://admin:5100');
      mockHttpService.delete.mockReturnValue(
        of({ data: { deleted: true }, status: 200 }),
      );

      const result = await client.executeHttpRequest('DELETE', '/delete/1', 'token');

      expect(result).toEqual({ deleted: true });
      expect(mockHttpService.delete).toHaveBeenCalledWith(
        'http://admin:5100/delete/1',
        { headers: { Authorization: 'Bearer token' } },
      );
    });
  });

  describe('error handling', () => {
    it('should throw HttpException with response status on error response', async () => {
      mockConfigService.get.mockReturnValue('http://admin:5100');
      mockHttpService.get.mockReturnValue(
        throwError(() => ({
          response: { status: 404, data: { message: 'Not found' } },
          message: 'Not found',
        })),
      );

      await expect(client.executeHttpRequest('GET', '/test', 'token')).rejects.toThrow(
        HttpException,
      );
    });

    it('should pass through error message from admin service', async () => {
      mockConfigService.get.mockReturnValue('http://admin:5100');
      mockHttpService.get.mockReturnValue(
        throwError(() => ({
          response: { status: 400, data: { message: 'Bad request from admin' } },
          message: 'Bad request',
        })),
      );

      try {
        await client.executeHttpRequest('GET', '/test', 'token');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(400);
      }
    });

    it('should throw SERVICE_UNAVAILABLE when no response received (network error)', async () => {
      mockConfigService.get.mockReturnValue('http://admin:5100');
      mockHttpService.get.mockReturnValue(
        throwError(() => ({
          request: {},
          message: 'ECONNREFUSED',
        })),
      );

      try {
        await client.executeHttpRequest('GET', '/test', 'token');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      }
    });

    it('should throw INTERNAL_SERVER_ERROR for unknown errors', async () => {
      mockConfigService.get.mockReturnValue('http://admin:5100');
      mockHttpService.get.mockReturnValue(
        throwError(() => ({
          message: 'Something went wrong',
        })),
      );

      try {
        await client.executeHttpRequest('GET', '/test', 'token');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should use default error message when data.message is not a string', async () => {
      mockConfigService.get.mockReturnValue('http://admin:5100');
      mockHttpService.get.mockReturnValue(
        throwError(() => ({
          response: { status: 500, data: { error: 'complex error' } },
          message: 'Server error',
        })),
      );

      try {
        await client.executeHttpRequest('GET', '/test', 'token');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        const response = (error as HttpException).getResponse() as { message: string };
        expect(response.message).toBe('Admin service returned an error response');
      }
    });
  });
});
