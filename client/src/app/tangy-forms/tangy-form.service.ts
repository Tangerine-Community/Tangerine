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
  formInputs: Array<any> = []
  constructor(
    private userService: UserService,
    private http: HttpClient,
    private tangyFormsInfoService: TangyFormsInfoService
  ) { }

  async getFormInput(formId, inputVariable) {
    const formInfo = await this.tangyFormsInfoService.getFormInfo(formId)
    let formMarkup: any = this.formsMarkup[formInfo.src]
    if (!this.formsMarkup[formInfo.src]) {
      formMarkup = await this.http.get(formInfo.src, {responseType: 'text'}).toPromise()
      this.formsMarkup[formInfo.src] = formMarkup;
    }
    // return formMarkup

    const tangyFormMarkup = await this.getFormMarkup(formId)
    const variableName = formInfo.src + inputVariable;
    const formInput: any = this.formInputs[variableName]
    if (!this.formInputs[variableName]) {
      // first populate the array
      const variablesByName = formInput.items.reduce((variablesByName, item) => {
        for (const input of item.inputs) {
          variablesByName[input.name] = input;
        }
        return variablesByName;
      }, {});
      const input = variablesByName[inputVariable]
      this.formInputs[variableName] = input;
      return input
    }
  }

  async getFormMarkup(formId) {
    const formInfo = await this.tangyFormsInfoService.getFormInfo(formId)
    let formMarkup:any = this.formsMarkup[formInfo.src]
    if (!this.formsMarkup[formInfo.src]) {
      formMarkup = await this.http.get(formInfo.src, {responseType: 'text'}).toPromise()
      this.formsMarkup[formInfo.src] = formMarkup;
    }
    return formMarkup
  }

  async getFormTemplateMarkup(formId:string, formTemplateId:string):Promise<string> {
    const formInfo = await this.tangyFormsInfoService.getFormInfo(formId)
    const formTemplate = formInfo.templates.find(formTemplate => formTemplate.id === formTemplateId)
    const formTemplateMarkup = await this.http.get(formTemplate.src, { responseType: 'text' }).toPromise()
    return formTemplateMarkup
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
    let db = await this.userService.getUserDatabase(await this.userService.getCurrentUser())
    try {
      let doc = await db.get(responseId)
      return doc
    } catch (e) {
      return false
    }
  }

  async getAllResponses() {
    let db = await this.userService.getUserDatabase(await this.userService.getCurrentUser())
    return (await db.allDocs({include_docs:true})).rows.map(row => row.doc)
  }

  async getResponsesByFormId(formId) {
    let currentUser = this.userService.getCurrentUser()
    let db = await this.userService.getUserDatabase(currentUser)
    let r = await db.query('tangy-form/responsesByFormId', { key: formId, include_docs: true })
    return r.rows.map((row) => new TangyFormResponseModel(row.doc))
  }

  async getResponsesByLocationId(locationId) {
    let db = await this.userService.getUserDatabase()
    let r = await db.query('tangy-form/responsesByLocationId', { key: locationId, include_docs: true })
    return r.rows.map((row) => row.doc)
  }
}
