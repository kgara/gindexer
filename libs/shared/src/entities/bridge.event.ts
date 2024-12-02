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
}
