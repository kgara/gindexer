import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndexerService } from './services/indexer.service';
import { RabbitMQService } from './services/rabbitmq.service';
import { BridgeEvent } from '@app/shared/entities/bridge.event';
import { Metadata } from '@app/shared/entities/metadata';
import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import config from '@app/shared/config/general.config';
import databaseConfig from '@app/shared/config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRoot(databaseConfig()),
    TypeOrmModule.forFeature([BridgeEvent, Metadata]),
  ],
  providers: [RabbitMQService, IndexerService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
