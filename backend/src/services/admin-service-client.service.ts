import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AdminServiceClient {
  private readonly logger = new Logger(AdminServiceClient.name);
  private readonly adminServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.adminServiceUrl =
      this.configService.get<string>('ADMIN_SERVICE_URL') ??
      'http://localhost:5100';
  }

  private getAuthHeaders(token: string): Record<string, string> {
    return {
      Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
    };
  }

  async executeHttpRequest<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    token: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.adminServiceUrl}${path}`;
    const headers = this.getAuthHeaders(token);

    this.logger.log(`Making ${method} request to: ${url}`);

    try {
      let response;
      switch (method) {
        case 'GET':
          response = await firstValueFrom(
            this.httpService.get(url, { headers }),
          );
          break;
        case 'POST':
          response = await firstValueFrom(
            this.httpService.post(url, body, { headers }),
          );
          break;
        case 'PUT':
          response = await firstValueFrom(
            this.httpService.put(url, body, { headers }),
          );
          break;
        case 'DELETE':
          response = await firstValueFrom(
            this.httpService.delete(url, { headers }),
          );
          break;
      }

      this.logger.log(`${method} ${path} - Success (${response.status})`);
      return response.data as T;
    } catch (error) {
      return this.handleError(error, `${method} ${path}`);
    }
  }

  private handleError(error: unknown, operation: string): never {
    const err = error as {
      response?: { status: number; data: unknown };
      request?: unknown;
      message: string;
    };
    if (err.response) {
      const { status, data } = err.response;
      this.logger.error(
        `${operation} failed with status ${status}: ${JSON.stringify(data)}`,
      );

      // Pass through the status code from admin-service
      const message =
        data &&
        typeof data === 'object' &&
        'message' in data &&
        typeof data.message === 'string'
          ? data.message
          : 'Admin service returned an error response';

      throw new HttpException({ message, statusCode: status }, status);
    } else if (err.request) {
      this.logger.error(
        `${operation} - No response from admin-service: ${err.message}`,
      );
      throw new HttpException(
        'Admin service is unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else {
      this.logger.error(`${operation} - Error: ${err.message}`);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
