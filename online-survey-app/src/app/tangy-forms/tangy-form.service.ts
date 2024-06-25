import { UserDatabase } from '../shared/classes/user-database.class';
import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {FormVersion} from "./classes/form-version.class";
import {TangyFormsInfoService} from "./tangy-forms-info-service";
import {FormInfo} from "./classes/form-info.class";

@Injectable()
export class TangyFormService {

  db:any;
  databaseName: String;
  groupId:string
  userId:string
  formsMarkup: Array<any> = []
  constructor(
    private httpClient:HttpClient,
    private tangyFormsInfoService: TangyFormsInfoService
  ) {
    this.databaseName = 'tangy-forms'
  }

  initialize(groupId) {
    this.userId = localStorage.getItem('user_id') || 'Survey'
    this.db = new UserDatabase(this.userId, groupId)
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

  /**
   * Gets markup for a form. If displaying a formResponse, populate the revision in order to display the correct form version.
   * @param formId
   * @param formVersionId - Uses this value to lookup the correct version to display. It is null if creating a new response.
   */
  async getFormMarkup(formId, formVersionId:string = '') {
    let formMarkup:any
    let src: string = await this.tangyFormsInfoService.getFormSrc(formId, formVersionId)
    formMarkup = await this.httpClient.get(src, {responseType: 'text'}).toPromise()
    return formMarkup
  }

}
