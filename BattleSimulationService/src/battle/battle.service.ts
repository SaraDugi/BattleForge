import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Battle } from './battle.entity';
import { BattleEvent } from './battle-event.entity';
import { Repository } from 'typeorm';
import { from, Observable, of, throwError } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { MessageBrokerService } from '../message-broker/message-broker.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class BattleService {
  constructor(
    @InjectRepository(Battle)
    private battleRepository: Repository<Battle>,
    @InjectRepository(BattleEvent)
    private battleEventRepository: Repository<BattleEvent>,
    private messageBrokerService: MessageBrokerService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  createBattle(player1Id: number, player2Id: number): Observable<Battle> {
    const battle = this.battleRepository.create({
      player1Id,
      player2Id,
      startTime: new Date(),
    });
    this.logger.log(`Creating battle: ${JSON.stringify(battle)}`);
    return from(this.battleRepository.save(battle));
  }

  getBattleById(id: number): Observable<Battle> {
    this.logger.log(`Getting battle with id: ${id}`);
    return from(
      this.battleRepository.findOne({
        where: { id },
        relations: ['events'],
      }),
    ).pipe(
      switchMap((battle) => {
        if (!battle) {
          this.logger.error(`Battle not found for id: ${id}`);
          return throwError(() => new Error('Battle not found'));
        }
        return of(battle);
      })
    );
  }

  getAllBattles(): Observable<Battle[]> {
    this.logger.log('Retrieving all battles');
    return from(this.battleRepository.find());
  }

  updateBattleStatus(battleId: number, status: string): Observable<Battle> {
    this.logger.log(`Updating battle status for id: ${battleId} to ${status}`);
    return from(this.battleRepository.findOne({ where: { id: battleId } })).pipe(
      switchMap((battle) => {
        if (!battle) {
          this.logger.error(`Battle not found for id: ${battleId}`);
          return throwError(() => new Error('Battle not found'));
        }
        battle.battleStatus = status;
        if (status.toUpperCase() === 'FINISHED') {
          battle.endTime = new Date();
        }
        return from(this.battleRepository.save(battle));
      }),
    );
  }

  setWinner(battleId: number, winnerId: number): Observable<Battle> {
    this.logger.log(`Setting winner for battle id: ${battleId} to winnerId: ${winnerId}`);
    return from(this.battleRepository.findOne({ where: { id: battleId } })).pipe(
      switchMap((battle) => {
        if (!battle) {
          this.logger.error(`Battle not found for id: ${battleId}`);
          return throwError(() => new Error('Battle not found'));
        }
        battle.winnerId = winnerId;
        battle.battleStatus = 'FINISHED';
        battle.endTime = new Date();
        return from(this.battleRepository.save(battle));
      }),
    );
  }

  addBattleEvent(battleId: number, eventType: string, description: string): Observable<BattleEvent> {
    this.logger.log(`Adding battle event for battle id: ${battleId} with eventType: ${eventType}`);
    return from(this.battleRepository.findOne({ where: { id: battleId } })).pipe(
      switchMap((battle) => {
        if (!battle) {
          this.logger.error(`Battle not found for id: ${battleId}`);
          return throwError(() => new Error('Battle not found'));
        }
        const event = this.battleEventRepository.create({
          eventType,
          description,
          eventTime: new Date(),
          battle,
        });
        return from(this.battleEventRepository.save(event));
      }),
      switchMap((savedEvent) => {
        this.logger.log(`Battle event saved: ${JSON.stringify(savedEvent)}`);
        return this.messageBrokerService.publish('/queue/battleEvents', savedEvent).pipe(
          map(() => {
            this.logger.log(`Published battle event: ${JSON.stringify(savedEvent)}`);
            return savedEvent;
          })
        );
      })
    );
  }

  getEventsForBattle(battleId: number): Observable<BattleEvent[]> {
    this.logger.log(`Getting events for battle id: ${battleId}`);
    return from(
      this.battleEventRepository.find({ where: { battle: { id: battleId } } })
    );
  }
}