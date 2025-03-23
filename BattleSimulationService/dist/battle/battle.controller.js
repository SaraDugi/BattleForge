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
exports.BattleController = void 0;
// src/battle/battle.controller.ts
const common_1 = require("@nestjs/common");
const battle_service_1 = require("./battle.service");
const rxjs_1 = require("rxjs");
let BattleController = class BattleController {
    constructor(battleService) {
        this.battleService = battleService;
    }
    createBattle(body) {
        return this.battleService.createBattle(body.player1Id, body.player2Id);
    }
    getAllBattles() {
        return this.battleService.getAllBattles();
    }
    getBattleById(battleId) {
        return this.battleService.getBattleById(Number(battleId));
    }
    updateBattleStatus(battleId, body) {
        return this.battleService.updateBattleStatus(Number(battleId), body.status);
    }
    setWinner(battleId, body) {
        return this.battleService.setWinner(Number(battleId), body.winnerId);
    }
    addEvent(battleId, body) {
        return this.battleService.addBattleEvent(Number(battleId), body.eventType, body.description);
    }
    getEvents(battleId) {
        return this.battleService.getEventsForBattle(Number(battleId));
    }
};
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", rxjs_1.Observable)
], BattleController.prototype, "createBattle", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", rxjs_1.Observable)
], BattleController.prototype, "getAllBattles", null);
__decorate([
    (0, common_1.Get)(':battleId'),
    __param(0, (0, common_1.Param)('battleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", rxjs_1.Observable)
], BattleController.prototype, "getBattleById", null);
__decorate([
    (0, common_1.Put)(':battleId/status'),
    __param(0, (0, common_1.Param)('battleId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", rxjs_1.Observable)
], BattleController.prototype, "updateBattleStatus", null);
__decorate([
    (0, common_1.Put)(':battleId/winner'),
    __param(0, (0, common_1.Param)('battleId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", rxjs_1.Observable)
], BattleController.prototype, "setWinner", null);
__decorate([
    (0, common_1.Post)(':battleId/events'),
    __param(0, (0, common_1.Param)('battleId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", rxjs_1.Observable)
], BattleController.prototype, "addEvent", null);
__decorate([
    (0, common_1.Get)(':battleId/events'),
    __param(0, (0, common_1.Param)('battleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", rxjs_1.Observable)
], BattleController.prototype, "getEvents", null);
BattleController = __decorate([
    (0, common_1.Controller)('api/battles'),
    __metadata("design:paramtypes", [battle_service_1.BattleService])
], BattleController);
exports.BattleController = BattleController;
