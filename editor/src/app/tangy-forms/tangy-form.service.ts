import { UserDatabase } from './../shared/_classes/user-database.class';
import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {FormVersion} from "./classes/form-version.class";
import {TangyFormsInfoService} from "./tangy-forms-info-service";
import {FormInfo} from "./classes/form-info.class";
import axios from 'axios'
import * as jsonpatch from "fast-json-patch";

@Injectable()
export class TangyFormService {

  db:any;
  databaseName: String;
  groupId:string
  formsMarkup: Array<any> = []
  constructor(
    private httpClient:HttpClient,
    private tangyFormsInfoService: TangyFormsInfoService
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

  async getDocRevHistory(docId) {
    const groupId = window.location.pathname.split('/')[2]
    const token = localStorage.getItem('token');
    const docWithRevs = (<any>await axios.get(`/db/${groupId}/${docId}?revs_info=true`)).data
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
          const currentDoc = (<any>await axios.get(`/db/${groupId}/${docId}?rev=${revId}`)).data
          const nextRev = nextRevision.rev
          const nextDoc = (<any>await axios.get(`/db/${groupId}/${docId}?rev=${nextRev}`)).data
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
