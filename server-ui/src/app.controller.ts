import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('nest/hello')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    console.log("get")
    return this.appService.getHello();
  }
}
