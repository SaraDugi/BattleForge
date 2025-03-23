// src/battle/battle.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Battle } from './battle.entity';
import { BattleEvent } from './battle-event.entity';
import { BattleService } from './battle.service';
import { BattleController } from './battle.controller';
import { MessageBrokerModule } from '../message-broker/message-broker.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Battle, BattleEvent]),
    MessageBrokerModule, // <-- Import here so MessageBrokerService is available
  ],
  providers: [BattleService],
  controllers: [BattleController],
})
export class BattleModule {}
