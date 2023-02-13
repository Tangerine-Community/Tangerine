import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {NestExpressApplication} from "@nestjs/platform-express";
const expressAppBootstrap = require('./express-app');

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  // console.log(`NPM_DEV_MODE: ${process.env.NPM_DEV_MODE}`)
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const httpAdapter = app.getHttpAdapter();
  const expressInstance = httpAdapter.getInstance()
  await expressAppBootstrap(expressInstance)
  await app.listen(80);
}
bootstrap();
