import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './auth/auth.module';
import { ConfigProxyModule } from './config/config.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validate,
    }),
    HttpModule,
    AuthModule,
    ConfigProxyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
