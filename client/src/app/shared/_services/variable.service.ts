import { Injectable } from '@angular/core';
import { DB } from '../_factories/db.factory';

@Injectable({
  providedIn: 'root'
})

/**
 * The VariablesService database is only for non-sensitive data. It is currently stored in an un-encrypted database.
 */
export class VariableService {

  db = DB('tangerine-variables')

  constructor() { }

  deprecatedLocalStorageFields = [
    'languageCode','installed','installed','languageDirection','ran-update-v3.4.0',
    'ran-update-v3.7.5','ran-update-v3.8.0','ran-update-v3.9.0','ran-update-v3.9.1','ran-update-v3.12.0'
  ]

  /**
   * For backward comparability, checks if deprecatedLocalStorageFields includes `name` and is in localStorage.
   * If it is, adds it to VariableService db and removes it from localStorage
   * @param name
   */
  async get(name) {
    let value;
    if (this.deprecatedLocalStorageFields.includes(name)) {
      value = localStorage.getItem(name);
    }
    if (value) {
      await this.set(name, value)
      localStorage.removeItem(name)
      return value
    } else {
      try {
        return (await this.db.get(name)).value
      } catch (error) {
        if (error.status && error.status !== 404) {
          console.log("error: " + JSON.stringify(error))
        }
        return undefined
      }
    }
  }

  async set(name, value) {
    let variable = {
      _id: name
    }
    try {
       variable = await this.db.get(name)
    } catch (error) {
      if (error.status && error.status !== 404) {
        console.log("error: " + JSON.stringify(error))
      }
    }
    this.db.put({
      ...variable,
      value
    }, function(err, response) {
      if (err) { return console.log(err); }
      // handle response
    });
  }

}
