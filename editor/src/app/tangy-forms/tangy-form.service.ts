import { UserDatabase } from './../shared/_classes/user-database.class';
import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {TangyFormResponseModel} from 'tangy-form/tangy-form-response-model.js'

@Injectable()
export class TangyFormService {

  db:any;
  databaseName: String;
  groupId:string

  constructor(
    private httpClient:HttpClient
  ) {
    this.databaseName = 'tangy-forms'
  }

  initialize(groupId) {
    this.db = new UserDatabase('Editor', groupId)
  }

  // Would be nice if this was queue based so if two saves get called at the same time, the differentials are sequentials updated
  // into the database. Using a getter and setter for property fields, this would be one way to queue.
  async saveResponse(response) {
    try {
      const doc = <any>await this.db.post(response)
      return doc
    } catch (e) {
      return false
    }
  }

  async getResponse(responseId) {
    try {
      const doc = <any>await this.db.get(responseId)
      return doc
    } catch (e) {
      return false
    }
  }

  async getAllResponses() {
    return []
  }

  async getResponsesByFormId(formId:string, limit:number = 99999999, skip:number = 0) {
    return <Array<any>>await this.httpClient.get(`/api/${this.groupId}/responsesByFormId/${formId}/${limit}/${skip}`).toPromise()
    /*
    return Array<TangyFormResponseModel>(<Array<any>>await this.httpClient.get(`/api/${groupId}/responsesByFormId/${formId}/${limit}/${skip}`).toPromise())
      .map((doc) => new TangyFormResponseModel(doc))
    */
  }

  async getFormMarkup(formId) {
    return await this.httpClient.get(`./assets/${formId}/form.html`, {responseType: 'text'}).toPromise()
  }

}
