import { Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private client: ClientProxy;

  constructor(private readonly configService: ConfigService) {
    this.init();
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.close();
    }
  }

  async publishEvent(pattern: string, message: any): Promise<void> {
    try {
      console.log(`Publishing message to RabbitMQ:`, message);
      await firstValueFrom(this.client.emit(pattern, message));
    } catch (error) {
      console.error(`Error publishing message to RabbitMQ:`, error);
      throw error;
    }
  }

  private init() {
    console.log('Initializing RabbitMQ Client...');
    const rabbitMQUrl = this.configService.get<string>('rabbitMQ.url');
    const rabbitMQQueue = this.configService.get<string>('rabbitMQ.queue');

    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitMQUrl],
        queue: rabbitMQQueue,
        queueOptions: {
          durable: true,
        },
      },
    });
    console.log('RabbitMQ Client initialized:', !!this.client);
  }
}
