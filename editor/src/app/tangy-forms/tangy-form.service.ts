import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {TangyFormResponseModel} from 'tangy-form/tangy-form-response-model.js'
// A dummy function so TS does not complain about our use of emit in our pouchdb queries.
const emit = (key, value) => {
  return true;
}

// @TODO Merge into tangerine-form.service.ts?

@Injectable()
export class TangyFormService {

  db:any;
  databaseName: String;

  constructor(
    private httpClient:HttpClient
  ) {
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

  async getResponseByFormId(groupId:string, formId:string, limit:number = 99999999, skip:number = 0) {
    return <Array<any>>await this.httpClient.get(`/api/${groupId}/responsesByFormId/${formId}/${limit}/${skip}`).toPromise()
    /*
    return Array<TangyFormResponseModel>(<Array<any>>await this.httpClient.get(`/api/${groupId}/responsesByFormId/${formId}/${limit}/${skip}`).toPromise())
      .map((doc) => new TangyFormResponseModel(doc))
    */
  }


}
