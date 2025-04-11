import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { BattleService } from './battle.service';
import { Observable } from 'rxjs';
import { Battle } from './battle.entity';
import { BattleEvent } from './battle-event.entity';

@Controller('api/battles')
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Post()
  createBattle(@Body() body: { player1Id: number; player2Id: number }): Observable<Battle> {
    return this.battleService.createBattle(body.player1Id, body.player2Id);
  }

  @Get()
  getAllBattles(): Observable<Battle[]> {
    return this.battleService.getAllBattles();
  }

  @Get(':battleId')
  getBattleById(@Param('battleId') battleId: string): Observable<Battle> {
    return this.battleService.getBattleById(Number(battleId));
  }

  @Put(':battleId/status')
  updateBattleStatus(
    @Param('battleId') battleId: string,
    @Body() body: { status: string },
  ): Observable<Battle> {
    return this.battleService.updateBattleStatus(Number(battleId), body.status);
  }

  @Put(':battleId/winner')
  setWinner(
    @Param('battleId') battleId: string,
    @Body() body: { winnerId: number },
  ): Observable<Battle> {
    return this.battleService.setWinner(Number(battleId), body.winnerId);
  }

  @Post(':battleId/events')
  addEvent(
    @Param('battleId') battleId: string,
    @Body() body: { eventType: string; description: string },
  ): Observable<BattleEvent> {
    return this.battleService.addBattleEvent(Number(battleId), body.eventType, body.description);
  }

  @Get(':battleId/events')
  getEvents(@Param('battleId') battleId: string): Observable<BattleEvent[]> {
    return this.battleService.getEventsForBattle(Number(battleId));
  }
}