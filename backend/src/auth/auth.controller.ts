import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  ServiceUnavailableException,
  InternalServerErrorException,
  HttpCode,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    body: LoginDto,
  ): Promise<{ message: string; token: string; expiresIn?: number }> {
    try {
      const result = await this.authService.login(
        body.username,
        body.password,
      );
      const response: { message: string; token: string; expiresIn?: number } = {
        message: 'Login successful',
        token: result.token,
      };
      if (result.expiresIn) {
        response.expiresIn = result.expiresIn;
      }
      return response;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.warn(
          `Authentication failed for user ${body.username}`,
        );
        throw error;
      } else if (error instanceof ServiceUnavailableException) {
        this.logger.error(
          'Auth service unavailable during login attempt',
        );
        throw error;
      } else {
        this.logger.error('Unexpected error during login');
        throw new InternalServerErrorException(
          'An unexpected error occurred during login',
        );
      }
    }
  }
}
