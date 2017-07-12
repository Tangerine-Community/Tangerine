import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/pairs';
import * as PouchDB from 'pouchdb';

@Injectable()
export class UserService {
  user = {};
  DB = new PouchDB('users');
  constructor() { }
  async create(userData) {
    this.user = userData;
    try {
      const result = await this.DB.post(this.user);
      return result;
    } catch (error) {
      console.log(error);
    }

  }
}
