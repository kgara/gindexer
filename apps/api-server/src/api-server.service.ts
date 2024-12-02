import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { BridgeEvent } from '@app/shared/entities/bridge.event';

@Injectable()
export class ApiServerService {
  constructor(
    @InjectRepository(BridgeEvent)
    private readonly bridgeEventRepository: Repository<BridgeEvent>,
  ) {}

  async getBridgeEvents(
    fromBlock: number,
    toBlock: number,
  ): Promise<Array<BridgeEvent>> {
    return this.bridgeEventRepository.find({
      where: {
        blockNumber: Between(fromBlock, toBlock),
      },
    });
  }
}
