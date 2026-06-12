import { NestModule, MiddlewareConsumer } from '@nestjs/common';
export declare class CoreModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void;
}
