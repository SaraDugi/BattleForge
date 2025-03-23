import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Battle } from './battle.entity';

@Entity({ name: 'battle_event' })
export class BattleEvent {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'event_type', type: 'varchar', length: 100, nullable: true })
  eventType?: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ 
    name: 'event_time', 
    type: 'datetime', 
    default: () => 'CURRENT_TIMESTAMP',
    update: false 
  })
  eventTime!: Date;

  @ManyToOne(() => Battle, (battle) => battle.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'battle_id' })
  battle!: Battle;
}