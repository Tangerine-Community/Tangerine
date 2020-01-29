import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb'
PouchDB.defaults({auto_compaction: true, revs_limit: 1})

@Injectable({
  providedIn: 'root'
})
export class VariableService {

  db = new PouchDB('tangerine-variables')

  constructor() { }

  async get(name) {
    try {
      return (await this.db.get(name)).value
    } catch {
      return undefined
    }
  }

  async set(name, value) {
    let variable = {
      _id: name
    }
    try {
       variable = await this.db.get(name)
    } catch {
      //
    }
    this.db.put({
      ...variable,
      value
    })
  }

}
