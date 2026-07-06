import { Test, type TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ServiceUnavailableException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
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
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should throw ServiceUnavailableException when TAZAMA_AUTH_URL is not set', async () => {
      mockConfigService.get.mockReturnValue(undefined);

      await expect(service.login('user', 'pass')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('should throw ServiceUnavailableException when TAZAMA_AUTH_URL is null', async () => {
      mockConfigService.get.mockReturnValue(null);

      await expect(service.login('user', 'pass')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('should return token and expiresIn on successful login with token in response', async () => {
      mockConfigService.get.mockReturnValue('http://auth-service');
      mockHttpService.post.mockReturnValue(
        of({ data: { token: 'jwt-token', expires_in: 3600 } }),
      );

      const result = await service.login('user', 'pass');
      expect(result.token).toBe('jwt-token');
      expect(result.expiresIn).toBe(3600);
      expect(result.message).toBe('Login successful');
    });

    it('should handle string response data as token', async () => {
      mockConfigService.get.mockReturnValue('http://auth-service');
      mockHttpService.post.mockReturnValue(of({ data: 'raw-token-string' }));

      const result = await service.login('user', 'pass');
      expect(result.token).toBe('raw-token-string');
    });

    it('should handle access_token field in response', async () => {
      mockConfigService.get.mockReturnValue('http://auth-service');
      mockHttpService.post.mockReturnValue(
        of({ data: { access_token: 'access-token', expires_in: 1800 } }),
      );

      const result = await service.login('user', 'pass');
      expect(result.token).toBe('access-token');
      expect(result.expiresIn).toBe(1800);
    });

    it('should handle jwt field in response', async () => {
      mockConfigService.get.mockReturnValue('http://auth-service');
      mockHttpService.post.mockReturnValue(
        of({ data: { jwt: 'jwt-field-token' } }),
      );

      const result = await service.login('user', 'pass');
      expect(result.token).toBe('jwt-field-token');
    });

    it('should handle user.token nested field in response', async () => {
      mockConfigService.get.mockReturnValue('http://auth-service');
      mockHttpService.post.mockReturnValue(
        of({ data: { user: { token: 'nested-token' } } }),
      );

      const result = await service.login('user', 'pass');
      expect(result.token).toBe('nested-token');
    });

    it('should handle expiresIn (camelCase) field in response', async () => {
      mockConfigService.get.mockReturnValue('http://auth-service');
      mockHttpService.post.mockReturnValue(
        of({ data: { token: 'tok', expiresIn: 7200 } }),
      );

      const result = await service.login('user', 'pass');
      expect(result.expiresIn).toBe(7200);
    });

    it('should return null expiresIn when not provided', async () => {
      mockConfigService.get.mockReturnValue('http://auth-service');
      mockHttpService.post.mockReturnValue(
        of({ data: { token: 'tok' } }),
      );

      const result = await service.login('user', 'pass');
      expect(result.expiresIn).toBeNull();
    });

    it('should throw ServiceUnavailableException when response data is falsy', async () => {
      mockConfigService.get.mockReturnValue('http://auth-service');
      mockHttpService.post.mockReturnValue(of({ data: null }));

      await expect(service.login('user', 'pass')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('should throw UnauthorizedException on 401 error', async () => {
      mockConfigService.get.mockReturnValue('http://auth-service');
      mockHttpService.post.mockReturnValue(
        throwError(() => ({ response: { status: 401 }, message: 'Unauthorized' })),
      );

      await expect(service.login('user', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ServiceUnavailableException on non-401 error', async () => {
      mockConfigService.get.mockReturnValue('http://auth-service');
      mockHttpService.post.mockReturnValue(
        throwError(() => ({ response: { status: 500 }, message: 'Server error' })),
      );

      await expect(service.login('user', 'pass')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('should throw ServiceUnavailableException on network error without response', async () => {
      mockConfigService.get.mockReturnValue('http://auth-service');
      mockHttpService.post.mockReturnValue(
        throwError(() => ({ message: 'Network error' })),
      );

      await expect(service.login('user', 'pass')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('should call httpService.post with correct URL and credentials', async () => {
      mockConfigService.get.mockReturnValue('http://auth-service:8080');
      mockHttpService.post.mockReturnValue(
        of({ data: { token: 'tok' } }),
      );

      await service.login('myuser', 'mypass');

      expect(mockHttpService.post).toHaveBeenCalledWith(
        'http://auth-service:8080/login',
        { username: 'myuser', password: 'mypass' },
      );
    });

    it('should throw ServiceUnavailableException when TAZAMA_AUTH_URL is empty string', async () => {
      mockConfigService.get.mockReturnValue('');

      await expect(service.login('user', 'pass')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('should handle response with both expires_in and expiresIn (snake_case takes priority)', async () => {
      mockConfigService.get.mockReturnValue('http://auth-service');
      mockHttpService.post.mockReturnValue(
        of({ data: { token: 'tok', expires_in: 3600, expiresIn: 1800 } }),
      );

      const result = await service.login('user', 'pass');
      expect(result.expiresIn).toBe(3600);
    });

    it('should handle response with user.token when token field also exists', async () => {
      mockConfigService.get.mockReturnValue('http://auth-service');
      mockHttpService.post.mockReturnValue(
        of({ data: { token: 'primary-token', user: { token: 'nested-token' } } }),
      );

      const result = await service.login('user', 'pass');
      // token field takes priority over user.token
      expect(result.token).toBe('primary-token');
    });
  });
});
