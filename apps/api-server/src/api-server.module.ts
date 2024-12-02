import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BridgeEvent } from '@app/shared/entities/bridge.event';
import { ApiServerController } from './api-server.controller';
import { ApiServerService } from './api-server.service';
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
    TypeOrmModule.forFeature([BridgeEvent]),
  ],
  controllers: [ApiServerController],
  providers: [ApiServerService],
})
export class ApiServerModule {}
