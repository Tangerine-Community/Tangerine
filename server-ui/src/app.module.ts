import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {CoreModule} from "./core/core.module";
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [CoreModule, ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', '../editor/dist/tangerine-editor'),
    // rootPath: '/tangerine/editor/dist/tangerine-editor',
    exclude: ['/api*'],
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
