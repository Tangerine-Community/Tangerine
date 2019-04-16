import { Injectable } from '@nestjs/common';
import { TangerineConfigService } from '../tangerine-config/tangerine-config.service';
import PouchDB from 'pouchdb'
import { v4 as UUID } from 'uuid'
import { User } from 'src/shared/classes/user';
const DB = require('../../../db')
const log = require('tangy-log').log

@Injectable()
export class UserService {

  DB = DB
  usersDb = new DB('users');

  constructor(private readonly configService:TangerineConfigService){}

  async getUserByUsername(username):Promise<User> {
    const result = await this.usersDb.find({ selector: { username } });
    return result.docs[0];
  }


}
