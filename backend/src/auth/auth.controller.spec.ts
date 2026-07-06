import { Test, type TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  ServiceUnavailableException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('login', () => {
    const validBody = { username: 'test@example.com', password: 'password123' };

    it('should return success response with token on successful login', async () => {
      mockAuthService.login.mockResolvedValue({
        message: 'Login successful',
        token: 'jwt-token',
        expiresIn: 3600,
      });

      const result = await controller.login(validBody);

      expect(result).toEqual({
        message: 'Login successful',
        token: 'jwt-token',
        expiresIn: 3600,
      });
    });

    it('should not include expiresIn when not provided', async () => {
      mockAuthService.login.mockResolvedValue({
        message: 'Login successful',
        token: 'jwt-token',
        expiresIn: null,
      });

      const result = await controller.login(validBody);

      expect(result.token).toBe('jwt-token');
      expect(result.expiresIn).toBeUndefined();
    });

    it('should not include expiresIn when provided as 0 (falsy)', async () => {
      mockAuthService.login.mockResolvedValue({
        message: 'Login successful',
        token: 'jwt-token',
        expiresIn: 0,
      });

      const result = await controller.login(validBody);

      // expiresIn: 0 is falsy, so the if(result.expiresIn) check won't include it
      expect(result.expiresIn).toBeUndefined();
    });

    it('should rethrow UnauthorizedException', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(validBody)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should rethrow ServiceUnavailableException', async () => {
      mockAuthService.login.mockRejectedValue(
        new ServiceUnavailableException('Service unavailable'),
      );

      await expect(controller.login(validBody)).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('should throw InternalServerErrorException for unknown errors', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Unknown error'));

      await expect(controller.login(validBody)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException for non-Error objects', async () => {
      mockAuthService.login.mockRejectedValue('string error');

      await expect(controller.login(validBody)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should call authService.login with username and password', async () => {
      mockAuthService.login.mockResolvedValue({
        message: 'Login successful',
        token: 'tok',
        expiresIn: null,
      });

      await controller.login(validBody);

      expect(authService.login).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
    });

    it('should rethrow UnauthorizedException with correct message', async () => {
      const error = new UnauthorizedException('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      try {
        await controller.login(validBody);
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect((e as UnauthorizedException).message).toBe('Invalid credentials');
      }
    });

    it('should rethrow ServiceUnavailableException with correct message', async () => {
      const error = new ServiceUnavailableException('Service unavailable');
      mockAuthService.login.mockRejectedValue(error);

      try {
        await controller.login(validBody);
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ServiceUnavailableException);
        expect((e as ServiceUnavailableException).message).toBe('Service unavailable');
      }
    });

    it('should throw InternalServerErrorException for Error instance', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Some error'));

      try {
        await controller.login(validBody);
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
      }
    });

    it('should throw InternalServerErrorException for null error', async () => {
      mockAuthService.login.mockRejectedValue(null);

      await expect(controller.login(validBody)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException for object error', async () => {
      mockAuthService.login.mockRejectedValue({ code: 500 });

      await expect(controller.login(validBody)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
