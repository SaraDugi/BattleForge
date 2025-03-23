"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const battle_entity_1 = require("./battle.entity");
const battle_event_entity_1 = require("./battle-event.entity");
const typeorm_2 = require("typeorm");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const message_broker_service_1 = require("../message-broker/message-broker.service");
const nest_winston_1 = require("nest-winston");
let BattleService = class BattleService {
    constructor(battleRepository, battleEventRepository, messageBrokerService, logger) {
        this.battleRepository = battleRepository;
        this.battleEventRepository = battleEventRepository;
        this.messageBrokerService = messageBrokerService;
        this.logger = logger;
    }
    createBattle(player1Id, player2Id) {
        const battle = this.battleRepository.create({
            player1Id,
            player2Id,
            startTime: new Date(),
        });
        this.logger.log(`Creating battle: ${JSON.stringify(battle)}`);
        return (0, rxjs_1.from)(this.battleRepository.save(battle));
    }
    getBattleById(id) {
        this.logger.log(`Getting battle with id: ${id}`);
        return (0, rxjs_1.from)(this.battleRepository.findOne({
            where: { id },
            relations: ['events'],
        })).pipe((0, operators_1.switchMap)((battle) => {
            if (!battle) {
                this.logger.error(`Battle not found for id: ${id}`);
                return (0, rxjs_1.throwError)(() => new Error('Battle not found'));
            }
            return (0, rxjs_1.of)(battle);
        }));
    }
    getAllBattles() {
        this.logger.log('Retrieving all battles');
        return (0, rxjs_1.from)(this.battleRepository.find());
    }
    updateBattleStatus(battleId, status) {
        this.logger.log(`Updating battle status for id: ${battleId} to ${status}`);
        return (0, rxjs_1.from)(this.battleRepository.findOne({ where: { id: battleId } })).pipe((0, operators_1.switchMap)((battle) => {
            if (!battle) {
                this.logger.error(`Battle not found for id: ${battleId}`);
                return (0, rxjs_1.throwError)(() => new Error('Battle not found'));
            }
            battle.battleStatus = status;
            if (status.toUpperCase() === 'FINISHED') {
                battle.endTime = new Date();
            }
            return (0, rxjs_1.from)(this.battleRepository.save(battle));
        }));
    }
    setWinner(battleId, winnerId) {
        this.logger.log(`Setting winner for battle id: ${battleId} to winnerId: ${winnerId}`);
        return (0, rxjs_1.from)(this.battleRepository.findOne({ where: { id: battleId } })).pipe((0, operators_1.switchMap)((battle) => {
            if (!battle) {
                this.logger.error(`Battle not found for id: ${battleId}`);
                return (0, rxjs_1.throwError)(() => new Error('Battle not found'));
            }
            battle.winnerId = winnerId;
            battle.battleStatus = 'FINISHED';
            battle.endTime = new Date();
            return (0, rxjs_1.from)(this.battleRepository.save(battle));
        }));
    }
    addBattleEvent(battleId, eventType, description) {
        this.logger.log(`Adding battle event for battle id: ${battleId} with eventType: ${eventType}`);
        return (0, rxjs_1.from)(this.battleRepository.findOne({ where: { id: battleId } })).pipe((0, operators_1.switchMap)((battle) => {
            if (!battle) {
                this.logger.error(`Battle not found for id: ${battleId}`);
                return (0, rxjs_1.throwError)(() => new Error('Battle not found'));
            }
            const event = this.battleEventRepository.create({
                eventType,
                description,
                eventTime: new Date(),
                battle,
            });
            return (0, rxjs_1.from)(this.battleEventRepository.save(event));
        }), (0, operators_1.switchMap)((savedEvent) => {
            this.logger.log(`Battle event saved: ${JSON.stringify(savedEvent)}`);
            return this.messageBrokerService.publish('/queue/battleEvents', savedEvent).pipe((0, operators_1.map)(() => {
                this.logger.log(`Published battle event: ${JSON.stringify(savedEvent)}`);
                return savedEvent;
            }));
        }));
    }
    getEventsForBattle(battleId) {
        this.logger.log(`Getting events for battle id: ${battleId}`);
        return (0, rxjs_1.from)(this.battleEventRepository.find({ where: { battle: { id: battleId } } }));
    }
};
BattleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(battle_entity_1.Battle)),
    __param(1, (0, typeorm_1.InjectRepository)(battle_event_entity_1.BattleEvent)),
    __param(3, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        message_broker_service_1.MessageBrokerService, Object])
], BattleService);
exports.BattleService = BattleService;
