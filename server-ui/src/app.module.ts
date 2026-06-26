import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {CoreModule} from "./core/core.module";
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [CoreModule, ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', '../editor/dist/tangerine-editor/browser'),
    // rootPath: '/tangerine/editor/dist/tangerine-editor/browser',
    exclude: ['/api*'],
  }), ServeStaticModule.forRoot({
    rootPath: '/tangerine/tangy-form',
    serveRoot: '/tangy-form',
    serveStaticOptions: { index: false }
  }), ServeStaticModule.forRoot({
    rootPath: '/tangerine/editor/node_modules',
    serveRoot: '/npm',
    serveStaticOptions: { index: false }
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
