"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBrokerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stompit_1 = require("stompit");
const rxjs_1 = require("rxjs");
const path = __importStar(require("path"));
const nest_winston_1 = require("nest-winston");
let MessageBrokerService = class MessageBrokerService {
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
    }
    onModuleInit() {
        // Load the CA certificate if needed (currently commented out because ssl is false)
        const caPath = path.resolve(process.cwd(), 'ca.pem');
        const connectOptions = {
            host: this.configService.get('ACTIVEMQ_HOST'),
            port: this.configService.get('ACTIVEMQ_PORT'),
            connectHeaders: {
                host: '/',
                login: this.configService.get('ACTIVEMQ_USERNAME'),
                passcode: this.configService.get('ACTIVEMQ_PASSCODE'),
            },
            ssl: false, // Change to true and uncomment below if using SSL with certificates:
            // ca: [fs.readFileSync(caPath)]
        };
        // Add explicit types for error and client parameters
        (0, stompit_1.connect)(connectOptions, (error, client) => {
            if (error) {
                this.logger.error('Error connecting to ActiveMQ:', error);
            }
            else {
                this.logger.log('Connected to ActiveMQ with SSL');
                this.client = client;
            }
        });
    }
    onModuleDestroy() {
        if (this.client) {
            this.client.disconnect();
            this.logger.log('Disconnected from ActiveMQ');
        }
    }
    publish(queue, message) {
        return new rxjs_1.Observable((observer) => {
            if (!this.client) {
                this.logger.error('Not connected to ActiveMQ');
                observer.error(new Error('Not connected to ActiveMQ'));
                return;
            }
            const frame = this.client.send({
                destination: queue,
                'content-type': 'application/json',
            });
            const msgString = JSON.stringify(message);
            frame.write(msgString);
            frame.end();
            this.logger.log(`Published message to ${queue}: ${msgString}`);
            observer.next({ success: true });
            observer.complete();
        });
    }
};
MessageBrokerService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER)),
    __metadata("design:paramtypes", [config_1.ConfigService, Object])
], MessageBrokerService);
exports.MessageBrokerService = MessageBrokerService;
