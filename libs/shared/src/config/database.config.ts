import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { BridgeEvent } from '@app/shared/entities/bridge.event';
import { Metadata } from '@app/shared/entities/metadata';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'ugindexer',
    password: 'pgindexer',
    database: 'gindexer',
    entities: [BridgeEvent, Metadata],
    synchronize: true,
  }),
);
