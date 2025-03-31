import { Test, TestingModule } from '@nestjs/testing';
import { BattleService } from './battle.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Battle } from './battle.entity';
import { BattleEvent } from './battle-event.entity';
import { Repository } from 'typeorm';
import { MessageBrokerService } from '../message-broker/message-broker.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { of } from 'rxjs';

describe('BattleService', () => {
  let service: BattleService;
  let battleRepo: jest.Mocked<Repository<Battle>>;
  let eventRepo: jest.Mocked<Repository<BattleEvent>>;
  let broker: MessageBrokerService;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BattleService,
        {
          provide: getRepositoryToken(Battle),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BattleEvent),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: MessageBrokerService,
          useValue: {
            publish: jest.fn().mockReturnValue(of({ success: true })),
          },
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<BattleService>(BattleService);
    battleRepo = module.get(getRepositoryToken(Battle));
    eventRepo = module.get(getRepositoryToken(BattleEvent));
    broker = module.get(MessageBrokerService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBattle', () => {
    it('should create and save a battle', (done) => {
      const mockBattle = {
        id: 1,
        player1Id: 1,
        player2Id: 2,
        startTime: new Date(),
        battleStatus: 'IN_PROGRESS',
        createdAt: new Date(),
      } as Battle;

      battleRepo.create.mockReturnValue(mockBattle);
      battleRepo.save.mockResolvedValue(mockBattle);

      service.createBattle(1, 2).subscribe((result) => {
        expect(battleRepo.create).toHaveBeenCalled();
        expect(battleRepo.save).toHaveBeenCalledWith(mockBattle);
        expect(result).toEqual(mockBattle);
        done();
      });
    });
  });

  describe('getBattleById', () => {
    it('should return battle with events', (done) => {
      const mockBattle = {
        id: 1,
        player1Id: 1,
        player2Id: 2,
        startTime: new Date(),
        createdAt: new Date(),
        battleStatus: 'IN_PROGRESS',
        events: [],
      } as Battle;

      battleRepo.findOne.mockResolvedValue(mockBattle);

      service.getBattleById(1).subscribe((battle) => {
        expect(battle).toEqual(mockBattle);
        done();
      });
    });

    it('should throw error if not found', (done) => {
      battleRepo.findOne.mockResolvedValue(null);

      service.getBattleById(99).subscribe({
        error: (err) => {
          expect(err.message).toEqual('Battle not found');
          done();
        },
      });
    });
  });

  describe('getAllBattles', () => {
    it('should return all battles', (done) => {
      const mockBattles = [{ id: 1 }, { id: 2 }] as Battle[];
      battleRepo.find.mockResolvedValue(mockBattles);

      service.getAllBattles().subscribe((battles) => {
        expect(battles).toEqual(mockBattles);
        done();
      });
    });
  });

  describe('updateBattleStatus', () => {
    it('should update battle status and endTime if finished', (done) => {
      const mockBattle = {
        id: 1,
        battleStatus: 'IN_PROGRESS',
        player1Id: 1,
        player2Id: 2,
        startTime: new Date(),
        createdAt: new Date(),
      } as Battle;

      const updatedBattle = {
        ...mockBattle,
        battleStatus: 'FINISHED',
        endTime: new Date(),
      };

      battleRepo.findOne.mockResolvedValue(mockBattle);
      battleRepo.save.mockResolvedValue(updatedBattle);

      service.updateBattleStatus(1, 'FINISHED').subscribe((updated) => {
        expect(updated.battleStatus).toBe('FINISHED');
        expect(updated.endTime).toBeDefined();
        done();
      });
    });

    it('should error if battle not found', (done) => {
      battleRepo.findOne.mockResolvedValue(null);

      service.updateBattleStatus(99, 'FINISHED').subscribe({
        error: (err) => {
          expect(err.message).toEqual('Battle not found');
          done();
        },
      });
    });
  });

  describe('setWinner', () => {
    it('should update winnerId and finish battle', (done) => {
      const mockBattle = {
        id: 1,
        battleStatus: 'IN_PROGRESS',
        player1Id: 1,
        player2Id: 2,
        startTime: new Date(),
        createdAt: new Date(),
      } as Battle;

      const updatedBattle = {
        ...mockBattle,
        winnerId: 10,
        battleStatus: 'FINISHED',
        endTime: new Date(),
      };

      battleRepo.findOne.mockResolvedValue(mockBattle);
      battleRepo.save.mockResolvedValue(updatedBattle);

      service.setWinner(1, 10).subscribe((updated) => {
        expect(updated.winnerId).toBe(10);
        expect(updated.battleStatus).toBe('FINISHED');
        expect(updated.endTime).toBeDefined();
        done();
      });
    });
  });

  describe('addBattleEvent', () => {
    it('should create and publish a battle event', (done) => {
      const mockBattle = {
        id: 1,
        player1Id: 1,
        player2Id: 2,
        startTime: new Date(),
        createdAt: new Date(),
        battleStatus: 'IN_PROGRESS',
      } as Battle;

      const mockEvent = {
        id: 1,
        eventType: 'HIT',
        description: 'critical hit',
        eventTime: new Date(),
        battle: mockBattle,
      } as BattleEvent;

      battleRepo.findOne.mockResolvedValue(mockBattle);
      eventRepo.create.mockReturnValue(mockEvent);
      eventRepo.save.mockResolvedValue(mockEvent);

      service.addBattleEvent(1, 'HIT', 'critical hit').subscribe((result) => {
        expect(eventRepo.create).toHaveBeenCalled();
        expect(eventRepo.save).toHaveBeenCalledWith(mockEvent);
        expect(broker.publish).toHaveBeenCalledWith('/queue/battleEvents', mockEvent);
        expect(result).toEqual(mockEvent);
        done();
      });
    });

    it('should error if battle not found', (done) => {
      battleRepo.findOne.mockResolvedValue(null);

      service.addBattleEvent(99, 'HIT', 'missed!').subscribe({
        error: (err) => {
          expect(err.message).toEqual('Battle not found');
          done();
        },
      });
    });
  });

  describe('getEventsForBattle', () => {
    it('should return all events for a battle', (done) => {
      const events = [{ id: 1 }, { id: 2 }] as BattleEvent[];
      eventRepo.find.mockResolvedValue(events);

      service.getEventsForBattle(1).subscribe((res) => {
        expect(res).toEqual(events);
        done();
      });
    });
  });
});