import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BridgeEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hash: string;

  @Index()
  @Column()
  blockNumber: number;

  @Column({ type: 'varchar' })
  amount: bigint;

  @Column({ type: 'varchar' })
  toChainId: bigint;

  @Column()
  bridgeName: string;

  @Column()
  token: string;

  @Column()
  sender: string;

  @Column()
  receiver: string;

  @Column()
  metadata: string;

  static builder() {
    return new BridgeEventBuilder();
  }
}

export class BridgeEventBuilder {
  private readonly bridgeEvent: BridgeEvent;

  constructor() {
    this.bridgeEvent = new BridgeEvent();
  }

  hash(hash: string): this {
    this.bridgeEvent.hash = hash;
    return this;
  }

  blockNumber(blockNumber: number): this {
    this.bridgeEvent.blockNumber = blockNumber;
    return this;
  }

  amount(amount: bigint): this {
    this.bridgeEvent.amount = amount;
    return this;
  }

  toChainId(toChainId: bigint): this {
    this.bridgeEvent.toChainId = toChainId;
    return this;
  }

  bridgeName(bridgeName: string): this {
    this.bridgeEvent.bridgeName = bridgeName;
    return this;
  }

  token(token: string): this {
    this.bridgeEvent.token = token;
    return this;
  }

  sender(sender: string): this {
    this.bridgeEvent.sender = sender;
    return this;
  }

  receiver(receiver: string): this {
    this.bridgeEvent.receiver = receiver;
    return this;
  }

  metadata(metadata: string): this {
    this.bridgeEvent.metadata = metadata;
    return this;
  }

  build(): BridgeEvent {
    return this.bridgeEvent;
  }
}
