import { Injectable } from '@nestjs/common';
const DB = require('../../../db')

@Injectable()
export class DbService {
  instantiate(dbName) {
    return new DB(dbName)
  }
}
