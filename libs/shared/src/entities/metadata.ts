import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Metadata {
  @PrimaryColumn()
  id: number;

  @Column()
  latestProcessedBlock: number;
}
