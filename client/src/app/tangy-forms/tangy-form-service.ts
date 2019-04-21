import PouchDB from 'pouchdb';
import {TangyFormResponseModel} from 'tangy-form/tangy-form-response-model.js'
import axios from 'axios'
import { FormInfo } from './classes/form-info.class';
import { Inject, Injectable } from '@angular/core';

// A dummy function so TS does not complain about our use of emit in our pouchdb queries.
const emit = (key, value) => {
  return true;
}

@Injectable({
  providedIn: 'root'
})
export class TangyFormService {

  db:any;
  databaseName: String;

  constructor(props) {
    this.databaseName = 'tangy-forms'
    Object.assign(this, props)
    this.db = new PouchDB(this.databaseName, {auto_compaction: true, revs_limit: 1})
  }

  async initialize() {
    console.warn('TangyFormService.initialize is deprecated and no longer needed. Please remove its usage.')
  }

  async getFormMarkup(formId) {
    const formInfo = await this.getFormInfo(formId)
    const formMarkup:any = (await axios.get(formInfo.src)).data
    return formMarkup
  }

  async getFormInfo(formId) {
    const formsInfo:any = await this.getFormsInfo()
    return formsInfo.find(formInfo => formInfo.id === formId)
  }

  async getFormsInfo() {
    const formsInfo:Array<FormInfo> = (await axios.get('./assets/forms.json')).data
    return formsInfo
  }

  async saveForm(formDoc) {
    let r
    if (!formDoc._id) {
      r = await this.db.post(formDoc)
    }
    else {
      r = await this.db.put(formDoc)
    }
    return await this.db.get(r.id)
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

  async getResponsesByFormId(formId) {
    let r = await this.db.query('tangy-form/responsesByFormId', { key: formId, include_docs: true })
    return r.rows.map((row) => new TangyFormResponseModel(row.doc))
  }

  async getResponsesByLocationId(locationId) {
    let r = await this.db.query('tangy-form/responsesByLocationId', { key: locationId, include_docs: true })
    return r.rows.map((row) => row.doc)
  }

}
