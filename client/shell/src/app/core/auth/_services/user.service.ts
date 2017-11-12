import 'rxjs/add/observable/from';
import 'rxjs/add/operator/filter';

import { Injectable } from '@angular/core';
import * as bcrypt from 'bcryptjs';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { Observable } from 'rxjs/Observable';
import { Uuid } from 'ng2-uuid';
@Injectable()
export class UserService {
  userData = {};
  DB = new PouchDB('users');
  USER_DATABASE_NAME = 'currentUser';
  constructor(private uuid: Uuid) { }
  async create(payload) {
    const uuidCode = this.uuid.v1();
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(payload.password, salt);
    this.userData = payload;
    this.userData['uuidCode'] = uuidCode;
    this.userData['password'] = hash;

    try {
      /**@todo check if user exists before saving */
      const postUserdata = await this.DB.post(this.userData);
      if (postUserdata) {
        const result = await this.initUserProfile(this.userData['username'], uuidCode);
        return result;
      }

    } catch (error) {
      console.error(error);
    }

  }

  async initUserProfile(userDBPath, profileId) {
    if (userDBPath) {
      const userDB = new PouchDB(userDBPath);
      try {
        const result = await userDB.put({
          _id: profileId,
          collection: 'user-profile'
        });
        return result;
      } catch (error) {
        console.error(error);
      }
    }
  }

  async getUserProfileId() {
    const userDBPath = await this.getUserDatabase();
    if (userDBPath) {
      const userDB = new PouchDB(userDBPath);
      let userProfileId: string;
      PouchDB.plugin(PouchDBFind);
      userDB.createIndex({
        index: { fields: ['collection'] }
      }).then((data) => { console.log('Indexing Succesful'); })
        .catch(err => console.error(err));

      try {
        const result = await userDB.find({ selector: { collection: 'user-profile' } });
        if (result.docs.length > 0) {
          userProfileId = result.docs[0]['_id'];
        }
      } catch (error) {
        console.error(error);
      }
      return userProfileId;
    }
  }

  async getUserProfile() {
    const userDBPath = await this.getUserDatabase();
    if (userDBPath) {
      const userDB = new PouchDB(userDBPath);
      let userProfileId: any;
      PouchDB.plugin(PouchDBFind);
      userDB.createIndex({
        index: { fields: ['collection'] }
      }).then((data) => { console.log('Indexing Succesful'); })
        .catch(err => console.error(err));

      try {
        const result = await userDB.find({ selector: { formId: 'user-profile', collection: 'TangyFormResponse' } });
        if (result.docs.length > 0) {
          userProfileId = result.docs[0];
        }
      } catch (error) {
        console.error(error);
      }
      const userProfile = await userDB.get(userProfileId._id);
      return userProfile;
    }
  }

  async doesUserExist(username) {
    let userExists: boolean;
    PouchDB.plugin(PouchDBFind);
    /**
     * @TODO We may want to run this on the first time when the app runs.
     */
    this.DB.createIndex({
      index: { fields: ['username'] }
    }).then((data) => { console.log('Indexing Succesful'); })
      .catch(err => console.error(err));

    try {
      const result = await this.DB.find({ selector: { username } });
      if (result.docs.length > 0) {
        userExists = true;
      } else { userExists = false; }
    } catch (error) {
      userExists = true;
      console.error(error);
    }
    return userExists;
  }

  async getAllUsers() {

    try {
      const result = await this.DB.allDocs({ include_docs: true });

      const users = [];
      Observable.from(result.rows).map(doc => doc).filter(doc => !doc['id'].startsWith('_design')).subscribe(doc => {
        users.push({
          username: doc['doc'].username,
          email: doc['doc'].email
        });
      });
      return users;
    } catch (error) {
      console.error(error);
    }
  }

  async setUserDatabase(username) {
    return await localStorage.setItem(this.USER_DATABASE_NAME, username);
  }

  async getUserDatabase() {
    return await localStorage.getItem(this.USER_DATABASE_NAME);
  }

  async removeUserDatabase() {
    localStorage.removeItem(this.USER_DATABASE_NAME);
  }

}
