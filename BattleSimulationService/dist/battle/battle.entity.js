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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Battle = void 0;
const typeorm_1 = require("typeorm");
const battle_event_entity_1 = require("./battle-event.entity");
let Battle = class Battle {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Battle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'player1_id', type: 'int', nullable: false }),
    __metadata("design:type", Number)
], Battle.prototype, "player1Id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'player2_id', type: 'int', nullable: false }),
    __metadata("design:type", Number)
], Battle.prototype, "player2Id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_time', type: 'datetime', nullable: false }),
    __metadata("design:type", Date)
], Battle.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_time', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Battle.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'winner_id', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Battle.prototype, "winnerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'battle_status', type: 'varchar', length: 50, default: 'IN_PROGRESS' }),
    __metadata("design:type", String)
], Battle.prototype, "battleStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'created_at',
        type: 'datetime',
        default: () => 'CURRENT_TIMESTAMP',
        update: false
    }),
    __metadata("design:type", Date)
], Battle.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => battle_event_entity_1.BattleEvent, (event) => event.battle, { cascade: true }),
    __metadata("design:type", Array)
], Battle.prototype, "events", void 0);
Battle = __decorate([
    (0, typeorm_1.Entity)({ name: 'battle' })
], Battle);
exports.Battle = Battle;
