import { NestFactory } from '@nestjs/core';
import { ApiServerModule } from './api-server.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(ApiServerModule);
  const configService: ConfigService = app.get<ConfigService>(ConfigService);
  const port = configService.get('apiServer.port');
  await app.listen(port);
}

bootstrap();
