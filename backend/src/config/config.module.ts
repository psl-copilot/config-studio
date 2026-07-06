import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { ConfigProxyService } from './config-proxy.service';
import { AdminServiceClient } from '../services/admin-service-client.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [HttpModule, ConfigModule, AuthModule],
  providers: [AdminServiceClient, ConfigProxyService],
  controllers: [ConfigController],
  exports: [ConfigProxyService, AdminServiceClient],
})
export class ConfigProxyModule {}
