import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/pairs';
import * as PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import * as bcrypt from 'bcryptjs';
@Injectable()
export class UserService {
  userData = {};
  DB = new PouchDB('users');
  constructor() { }
  async create(payload) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(payload.password, salt);
    this.userData = payload;
    this.userData['password'] = hash;

    try {
      /**@todo check if user exists before saving */
      const result = await this.DB.post(this.userData);
      return result;
    } catch (error) {
      console.log(error);
    }

  }

  async doesUserExist(username) {
    let userExists: boolean;
    PouchDB.plugin(PouchDBFind);
    this.DB.createIndex({
      index: { fields: ['username'] }
    }).then((data) => { console.log('Indexing Succesful'); })
      .catch(err => console.log(err));

    try {
      const result = await this.DB.find({ selector: { username } });
      if (result.docs.length > 0) {
        userExists = true;
      } else { userExists = false; }
    } catch (error) {
      userExists = true;
      console.log(error);
    }
    return userExists;
  }
}
