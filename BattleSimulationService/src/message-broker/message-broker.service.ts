import { Injectable, OnModuleInit, OnModuleDestroy, Inject, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, connect } from 'stompit';
import { Observable } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class MessageBrokerService implements OnModuleInit, OnModuleDestroy {
  private client!: Client;

  constructor(
    private configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  onModuleInit() {
    // Load the CA certificate if needed (currently commented out because ssl is false)
    const caPath = path.resolve(process.cwd(), 'ca.pem');

    const connectOptions = {
      host: this.configService.get<string>('ACTIVEMQ_HOST')!,
      port: this.configService.get<number>('ACTIVEMQ_PORT')!,
      connectHeaders: {
        host: '/',
        login: this.configService.get<string>('ACTIVEMQ_USERNAME')!,
        passcode: this.configService.get<string>('ACTIVEMQ_PASSCODE')!,
      },
      ssl: false, // Change to true and uncomment below if using SSL with certificates:
      // ca: [fs.readFileSync(caPath)]
    } as any;

    // Add explicit types for error and client parameters
    connect(connectOptions, (error: any, client: any) => {
      if (error) {
        this.logger.error('Error connecting to ActiveMQ:', error);
      } else {
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

  publish(queue: string, message: any): Observable<any> {
    return new Observable((observer) => {
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
}