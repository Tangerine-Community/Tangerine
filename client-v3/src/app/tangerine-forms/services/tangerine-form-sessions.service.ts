import { Injectable } from '@angular/core';
import * as PouchDB from 'pouchdb';
@Injectable()
export class TangerineFormSessionsService {
  DB = new PouchDB('tangerine-form-sessions');
  constructor() {
  }
  async getAll() {
    try {
      const result = await this.DB.allDocs({
        include_docs: true
      });
      return result.rows;
    } catch (error) {
      console.log(error);
    }
  }

  async add(session) {
    try {
      const response = await this.DB.post(session);
      session._rev = response.rev;
      console.log('TangerineFormSession._id', session._id);
      return session;
    } catch (error) {
      console.log(error);
    }
  }

  async update(session) {
    try {
      const response = await this.DB.put(session);
      session._rev = response.rev;
      console.log('TangerineFormSession._rev', session._rev);
      return session;
    } catch (error) {
      console.log(error);
    }
  }

  async delete(session) {
    try {
      const response = await this.DB.delete(session);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }
}
