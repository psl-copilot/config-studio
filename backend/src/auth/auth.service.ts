import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async login(
    username: string,
    password: string,
  ): Promise<{ message: string; token: string; expiresIn: number | null }> {
    const authUrl = this.configService.get<string>('TAZAMA_AUTH_URL');
    if (!authUrl) {
      this.logger.error('TAZAMA_AUTH_URL is not set in environment variables');
      throw new ServiceUnavailableException(
        'Authentication service unavailable',
      );
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${authUrl}/login`, { username, password }),
      );

      if (!response.data) {
        this.logger.error('Auth service did not return a valid response');
        throw new ServiceUnavailableException(
          'Authentication service unavailable',
        );
      }
      this.logger.log('Auth service responded');

      const token =
        typeof response.data === 'string'
          ? response.data
          : (response.data?.token ??
            response.data?.access_token ??
            response.data?.jwt ??
            response.data?.user?.token);

      return {
        message: 'Login successful',
        token,
        expiresIn:
          response.data?.expires_in ?? response.data?.expiresIn ?? null,
      };
    } catch (error) {
      if (error.response?.status === 401) {
        this.logger.warn(`Invalid credentials for user ${username}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      this.logger.error(
        `Auth service error during login: ${error.message}`,
      );
      throw new ServiceUnavailableException(
        'Authentication service unavailable',
      );
    }
  }
}
