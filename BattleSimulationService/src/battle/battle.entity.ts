import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BattleEvent } from './battle-event.entity';

@Entity({ name: 'battle' })
export class Battle {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'player1_id', type: 'int', nullable: false })
  player1Id!: number;

  @Column({ name: 'player2_id', type: 'int', nullable: false })
  player2Id!: number;

  @Column({ name: 'start_time', type: 'datetime', nullable: false })
  startTime!: Date;

  @Column({ name: 'end_time', type: 'datetime', nullable: true })
  endTime?: Date;

  @Column({ name: 'winner_id', type: 'int', nullable: true })
  winnerId?: number;

  @Column({ name: 'battle_status', type: 'varchar', length: 50, default: 'IN_PROGRESS' })
  battleStatus!: string;

  @Column({ 
    name: 'created_at', 
    type: 'datetime', 
    default: () => 'CURRENT_TIMESTAMP',
    update: false 
  })
  createdAt!: Date;

  @OneToMany(() => BattleEvent, (event) => event.battle, { cascade: true })
  events!: BattleEvent[];
}