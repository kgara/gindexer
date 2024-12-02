import { Injectable } from '@nestjs/common';
import { ethers, JsonRpcProvider } from 'ethers';
import { BridgeEvent } from '@app/shared/entities/bridge.event';
import { Metadata } from '@app/shared/entities/metadata';
import { EntityManager, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class IndexerService {
  private readonly FINALIZATION_GAP = 10;
  private readonly EVENT_SIGNATURE =
    'SocketBridge(uint256,address,uint256,bytes32,address,address,bytes32)';
  private readonly EVENT_ABI = [
    'event SocketBridge(uint256 amount, address token, uint256 toChainId, bytes32 bridgeName, address sender, address receiver, bytes32 metadata)',
  ];
  private readonly eventInterface = new ethers.Interface(this.EVENT_ABI);

  private readonly provider: JsonRpcProvider;

  constructor(
    @InjectRepository(BridgeEvent)
    private bridgeEventRepository: Repository<BridgeEvent>,
    @InjectRepository(Metadata)
    private readonly metadataRepository: Repository<Metadata>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
    private readonly rabbitMQService: RabbitMQService,
  ) {
    this.provider = new JsonRpcProvider(
      this.configService.get<string>('rpcEndpoint'),
    );
  }

  async startIndexing() {
    let latestProcessedBlock: number = await this.getLatestProcessedBlock();
    if (!latestProcessedBlock) latestProcessedBlock = 0;
    console.log('Starting from block: ', latestProcessedBlock + 1);

    await this.performReconciliation(latestProcessedBlock + 1);
    await this.subscribeToBlockCreation();
  }

  private async performReconciliation(startBlockNumber: number) {
    let currentBlockNumber = startBlockNumber;
    console.log('Reconciliation started from block: ', currentBlockNumber);
    let latestBlockNumber = await this.getLatestBlockNumber();
    do {
      while (currentBlockNumber < latestBlockNumber - this.FINALIZATION_GAP) {
        try {
          await this.entityManager.transaction(
            async (entityManager) =>
              await this.processBlock(currentBlockNumber, entityManager),
          );
        } catch (error) {
          console.warn('Block processing unsuccessful: ', currentBlockNumber);
          continue;
        }
        currentBlockNumber++;
      }
      // In case reconciliation was really long adding one more external loop around
      // to be even closer to recent blocks after it,
      // though prevent the excessive usage of getLatestBlockNumber RPC call
      latestBlockNumber = await this.getLatestBlockNumber();
    } while (currentBlockNumber < latestBlockNumber - this.FINALIZATION_GAP);
    console.log('Reconciliation finished on block: ', currentBlockNumber);
  }

  private async processBlock(
    blockNumber: number,
    entityManager: EntityManager,
  ) {
    try {
      console.log('Processing block:', blockNumber);
      const filter = {
        fromBlock: blockNumber,
        toBlock: blockNumber,
        address: this.configService.get<string>('contractAddress'),
        topics: [ethers.id(this.EVENT_SIGNATURE)],
      };
      const logs = await this.provider.getLogs(filter);
      console.log('Events:', logs);
      for (const log of logs) {
        let parsedLog;
        try {
          parsedLog = this.eventInterface.parseLog(log);
        } catch (error) {
          console.error('Error parsing SocketBridge log:', error);
          continue;
        }
        const amount = parsedLog.args[0];
        const token = parsedLog.args[1];
        const toChainId = parsedLog.args[2];
        const bridgeName = parsedLog.args[3];
        const sender = parsedLog.args[4];
        const receiver = parsedLog.args[5];
        const metadata = parsedLog.args[6];
        const transactionHash = log.transactionHash;
        //
        const bridgeEvent = BridgeEvent.builder()
          .hash(transactionHash)
          .blockNumber(blockNumber)
          .amount(amount)
          .toChainId(toChainId)
          .bridgeName(bridgeName)
          .token(token)
          .sender(sender)
          .receiver(receiver)
          .metadata(metadata)
          .build();
        await this.storeBridgeEvent(bridgeEvent, entityManager);
        await this.publishEventToQueue(bridgeEvent);
      }
      await this.updateLatestProcessedBlock(blockNumber, entityManager);
      console.log('Processed block:', blockNumber);
    } catch (error) {
      console.warn('Error occurred during transaction execution:', error);
      throw error;
    }
  }

  private async storeBridgeEvent(
    bridgeEvent: BridgeEvent,
    entityManager: EntityManager,
  ) {
    await entityManager.save(bridgeEvent);
  }

  private async publishEventToQueue(event: BridgeEvent) {
    const message = {
      id: event.id,
      hash: event.hash,
      blockNumber: event.blockNumber,
      amount: event.amount.toString(),
      toChainId: event.toChainId.toString(),
      bridgeName: event.bridgeName,
      token: event.token,
      sender: event.sender,
      receiver: event.receiver,
      metadata: event.metadata,
    };
    //
    await this.rabbitMQService.publishEvent('bridge-events.created', message);
  }

  private async getLatestBlockNumber() {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      console.log('Latest block number:', blockNumber);
      return blockNumber;
    } catch (error) {
      console.error('Error occurred:', error);
    }
  }

  private async getLatestProcessedBlock(): Promise<number> {
    const metadata = await this.metadataRepository.findOne({
      where: { id: 0 },
    });
    return metadata ? metadata.latestProcessedBlock : null;
  }

  private async updateLatestProcessedBlock(
    blockNumber: number,
    entityManager: EntityManager,
  ) {
    const metadata = new Metadata();
    metadata.id = 0;
    metadata.latestProcessedBlock = blockNumber;
    await entityManager.save(metadata);
  }

  private async subscribeToBlockCreation() {
    try {
      console.log('Subscribing for new blocks');
      this.provider.on('block', async (blockNumber: number) => {
        console.log('New block created - Block number: ', blockNumber);
        await this.performReconciliation(
          (await this.getLatestProcessedBlock()) + 1,
        );
      });
    } catch (error) {
      console.error('Error occurred:', error);
    }
  }
}
