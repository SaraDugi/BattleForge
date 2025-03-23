// src/message-broker/message-broker.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessageBrokerService } from './message-broker.service';

@Module({
  imports: [ConfigModule],
  providers: [MessageBrokerService],
  exports: [MessageBrokerService], // Export it so other modules can use it
})
export class MessageBrokerModule {}
