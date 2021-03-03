import { Injectable } from '@angular/core';
import { UserService } from '../shared/_services/user.service';
import { HttpClient } from '@angular/common/http';
import { FormInfo } from './classes/form-info.class';
import {TangyFormResponseModel} from 'tangy-form/tangy-form-response-model.js'
import {TangyFormsInfoService} from './tangy-forms-info-service';
import {FormVersion} from "./classes/form-version.class";
import * as jsonpatch from "fast-json-patch";


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

  async getFormInput(formId, inputVariable, revision) {
    const formInfo = await this.tangyFormsInfoService.getFormInfo(formId)
    let key = revision ? formInfo.src + revision : formInfo.src;
    const variableName = key + inputVariable;
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

  /**
   * Gets markup for a form. If displaying a formResponse, populate the revision in order to display the correct form version.
   * @param formId
   * @param formVersionId - Uses this value to lookup the correct version to display. It is null if 
   */
  async getFormMarkup(formId, formVersionId:string = '') {
    let formMarkup:any
    let src: string = await this.tangyFormsInfoService.getFormSrc(formId, formVersionId)
    formMarkup = await this.http.get(src, {responseType: 'text'}).toPromise()
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

  async getDocRevHistory(docId) {
    let db = (await this.userService.getUserDatabase()).db
    const docWithRevs = await db.get(docId,{revs_info:true})
    const revisions = docWithRevs._revs_info
    let comparisons = []
    if (revisions) {
      // filter out missing
      const availableRevisions = revisions.filter(rev => rev.status === 'available')
      // loop through the revisionIds, fetch each one, and compare in-order.
      for (let index = 0; index < availableRevisions.length; index++) {
        const revision = availableRevisions[index]
        const revId = revision.rev
        const nextRevision = availableRevisions[index+1]
        if (nextRevision) {
          const currentDoc = await db.get(docId,{rev:revId})
          const nextRev = nextRevision.rev
          const nextDoc = await db.get(docId,{rev:nextRev})
          const comparison = jsonpatch.compare(nextDoc, currentDoc).filter(mod => mod.path.substr(0,8) !== '/history')
          const comparisonDoc = {
            lastRev: nextRev,
            patch: comparison
          }
          comparisons.push(comparisonDoc)
        }
      }
    }
    return comparisons
  }

}
