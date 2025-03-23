"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBrokerModule = void 0;
// src/message-broker/message-broker.module.ts
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const message_broker_service_1 = require("./message-broker.service");
let MessageBrokerModule = class MessageBrokerModule {
};
MessageBrokerModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [message_broker_service_1.MessageBrokerService],
        exports: [message_broker_service_1.MessageBrokerService], // Export it so other modules can use it
    })
], MessageBrokerModule);
exports.MessageBrokerModule = MessageBrokerModule;
