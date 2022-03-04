import { Injectable } from '@nestjs/common';
@Injectable()
export class MysqlService {
  connectionCreated: boolean;
  constructor() {
    console.log('MysqlService');
    this.connectionCreated = false
  }
  setConnectionCreated(connectionCreated: boolean) {
    this.connectionCreated = connectionCreated
    console.log("setConnectionCreated", this.connectionCreated)
  }
}