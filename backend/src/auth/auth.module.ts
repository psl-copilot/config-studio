import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TazamaAuthGuard } from './tazama-auth.guard';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [AuthService, TazamaAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, TazamaAuthGuard],
})
export class AuthModule {}
