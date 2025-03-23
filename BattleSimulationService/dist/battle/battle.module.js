"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleModule = void 0;
// src/battle/battle.module.ts
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const battle_entity_1 = require("./battle.entity");
const battle_event_entity_1 = require("./battle-event.entity");
const battle_service_1 = require("./battle.service");
const battle_controller_1 = require("./battle.controller");
const message_broker_module_1 = require("../message-broker/message-broker.module");
let BattleModule = class BattleModule {
};
BattleModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([battle_entity_1.Battle, battle_event_entity_1.BattleEvent]),
            message_broker_module_1.MessageBrokerModule, // <-- Import here so MessageBrokerService is available
        ],
        providers: [battle_service_1.BattleService],
        controllers: [battle_controller_1.BattleController],
    })
], BattleModule);
exports.BattleModule = BattleModule;
