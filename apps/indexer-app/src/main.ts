import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IndexerService } from './services/indexer.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const indexerService = app.get(IndexerService);
  await indexerService.startIndexing();
}

bootstrap();
