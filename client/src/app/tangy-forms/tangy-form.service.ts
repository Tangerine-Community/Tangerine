import { Injectable } from '@angular/core';
import { UserService } from '../shared/_services/user.service';
import { HttpClient } from '@angular/common/http';
import { FormInfo } from './classes/form-info.class';
import {TangyFormResponseModel} from 'tangy-form/tangy-form-response-model.js'
import {TangyFormsInfoService} from './tangy-forms-info-service';


@Injectable({
  providedIn: 'root'
})
export class TangyFormService {
  formsInfo: Array<FormInfo>
  formsMarkup: Array<any> = []
  constructor(
    private userService: UserService,
    private http: HttpClient,
    private tangyFormsInfoService: TangyFormsInfoService
  ) { }

  async getFormMarkup(formId) {
    const formInfo = await this.getFormInfo(formId)
    let formMarkup:any = this.formsMarkup[formInfo.src]
    if (!this.formsMarkup[formInfo.src]) {
      formMarkup = await this.http.get(formInfo.src, {responseType: 'text'}).toPromise()
      this.formsMarkup[formInfo.src] = formMarkup;
    }
    return formMarkup
  }

  async getFormInfo(formId) {
    const formsInfo:any = await this.getFormsInfo()
    return formsInfo.find(formInfo => formInfo.id === formId)
  }

  /**
   * @deprecated since version 3.8.1
   */
  async getFormsInfo() {
    this.formsInfo = await this.tangyFormsInfoService.getFormsInfo()
    return this.formsInfo
  }

  async saveForm(formDoc) {
    let db = await this.userService.getUserDatabase()
    let r
    if (!formDoc._id) {
      r = await db.post(formDoc)
    }
    else {
      r = await db.put(formDoc)
    }
    return await db.get(r.id)
  }

  // Would be nice if this was queue based so if two saves get called at the same time, the differentials are sequentials updated
  // into the database. Using a getter and setter for property fields, this would be one way to queue.
  async saveResponse(responseDoc) {
    let db = await this.userService.getUserDatabase()
    let r
    if (!responseDoc._id) {
      r = await db.post(responseDoc)
    }
    else {
      r = await db.put(responseDoc)
    }
    return await db.get(r.id)
  }

  async getResponse(responseId) {
    let db = await this.userService.getUserDatabase(this.userService.getCurrentUser())
    try {
      let doc = await db.get(responseId)
      return doc
    } catch (e) {
      return false
    }
  }

  async getAllResponses() {
    let db = await this.userService.getUserDatabase(this.userService.getCurrentUser())
    return (await db.allDocs({include_docs:true})).rows.map(row => row.doc)
  }

  async getResponsesByFormId(formId) {
    let db = await this.userService.getUserDatabase(this.userService.getCurrentUser())
    let r = await db.query('tangy-form/responsesByFormId', { key: formId, include_docs: true })
    return r.rows.map((row) => new TangyFormResponseModel(row.doc))
  }

  async getResponsesByLocationId(locationId) {
    let db = await this.userService.getUserDatabase()
    let r = await db.query('tangy-form/responsesByLocationId', { key: locationId, include_docs: true })
    return r.rows.map((row) => row.doc)
  }
}
