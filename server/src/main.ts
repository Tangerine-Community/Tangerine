import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const expressAppBootstrap = require('./express-app');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const httpAdapter = app.getHttpAdapter();
  const expressInstance = httpAdapter.getInstance()
  await expressAppBootstrap(expressInstance)
  await app.listen(80);
}
bootstrap();
