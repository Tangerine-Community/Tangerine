import { Injectable } from '@nestjs/common';
const DB = require('../../../db')
const PouchDB = require('pouchdb')

@Injectable()
export class DbService {
  instantiate(dbName) {
    return new DB(dbName)
  }
}
