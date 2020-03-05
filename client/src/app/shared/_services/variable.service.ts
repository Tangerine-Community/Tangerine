import { Injectable } from '@angular/core';
import { DB } from '../_factories/db.factory';

@Injectable({
  providedIn: 'root'
})
export class VariableService {

  db = DB('tangerine-variables')

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
