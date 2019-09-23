/*
 * This is the successor to tangy-form-service.ts. Same API, more standard Angular Pattern.
 */

import { Injectable } from '@angular/core';
import { UserService } from '../shared/_services/user.service';
import { HttpClient } from '@angular/common/http';
import { FormInfo } from './classes/form-info.class';
import {TangyFormResponseModel} from 'tangy-form/tangy-form-response-model.js'


@Injectable({
  providedIn: 'root'
})
export class TangyFormService {

  constructor(
    private userService:UserService,
    private http:HttpClient
  ) { }

  async getFormMarkup(formId) {
    const formInfo = await this.getFormInfo(formId)
    const formMarkup:any = await this.http.get(formInfo.src, {responseType: 'text'}).toPromise()
    return formMarkup
  }

  // This doesn't quite work.
  getFormMarkupForQuery(formId) {
    let returnedMarkup = '';
    const formsInfoRequest = this.http.get('./assets/forms.json').toPromise().then(
      (response) => {
        const formsInfo = <Array<FormInfo>>(response);
        const formUrl = (formsInfo.find(form => form.id === formId)).src;
        const formMarkup: any = this.http.get(formUrl, {responseType: 'text'}).toPromise().then(
          (markup) => {
            returnedMarkup = markup;
          }
        );
      }
    );
    return returnedMarkup;
  }


  async getFormInfo(formId) {
    const formsInfo:any = await this.getFormsInfo()
    return formsInfo.find(formInfo => formInfo.id === formId)
  }

  async getFormsInfo() {
    const formsInfo = <Array<FormInfo>>await this.http.get('./assets/forms.json').toPromise()
    return formsInfo
  }

  async saveForm(formDoc) {
    let db = this.userService.getUserDatabase()
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
    let db = this.userService.getUserDatabase()
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
    let db = this.userService.getUserDatabase(this.userService.getCurrentUser())
    try {
      let doc = await db.get(responseId)
      return doc
    } catch (e) {
      return false
    }
  }

  async getResponsesByFormId(formId) {
    let db = this.userService.getUserDatabase(this.userService.getCurrentUser())
    let r = await db.query('tangy-form/responsesByFormId', { key: formId, include_docs: true })
    return r.rows.map((row) => new TangyFormResponseModel(row.doc))
  }

  async getResponsesByLocationId(locationId) {
    let db = this.userService.getUserDatabase()
    let r = await db.query('tangy-form/responsesByLocationId', { key: locationId, include_docs: true })
    return r.rows.map((row) => row.doc)
  }
}
