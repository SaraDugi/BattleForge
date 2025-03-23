import * as crypto from 'crypto';

if (!globalThis.crypto) {
  globalThis.crypto = crypto.webcrypto as unknown as Crypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Battle Simulation Service')
    .setDescription('API documentation for the Battle Simulation microservice')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(7000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();