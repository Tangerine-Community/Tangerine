import {Http} from '@angular/http';
import {Injectable} from '@angular/core';
// A dummy function so TS does not complain about our use of emit in our pouchdb queries.
const emit = (key, value) => {
  return true;
}

@Injectable()
export class TangyFormService {

  db:any;
  databaseName: String;

  constructor(public http: Http) {
    this.databaseName = 'tangy-forms'
  }

  // Would be nice if this was queue based so if two saves get called at the same time, the differentials are sequentials updated
  // into the database. Using a getter and setter for property fields, this would be one way to queue.
  async saveResponse(responseDoc) {
    let r
    if (!responseDoc._id) {
      r = await this.db.post(responseDoc)
    }
    else {
      r = await this.db.put(responseDoc)
    }
    return await this.db.get(r.id)

  }

  async getResponse(responseId) {
    try {
      let doc = await this.db.get(responseId)
      return doc
    } catch (e) {
      return false
    }
  }


}
