import { Injectable } from '@angular/core';
import * as PouchDB from 'pouchdb';
@Injectable()
export class DataService {
  DB = new PouchDB('locations');
  constructor() { }
  async getParentNodes() {
    try {
      const result = await this.DB.allDocs({
        include_docs: true
      });
      return result.rows;
    } catch (error) {
      console.log(error);
    }
  }

  async createNode(node) {
    try {
      const response = await this.DB.post(node);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }
}
