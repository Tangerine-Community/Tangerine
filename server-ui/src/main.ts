import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {NestExpressApplication} from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // console.log(`NPM_DEV_MODE: ${process.env.NPM_DEV_MODE}`)
  await app.listen(80);
}
bootstrap();
