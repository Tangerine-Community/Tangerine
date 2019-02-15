import { Injectable } from '@angular/core';
import {Feedback} from "./feedback";
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {FormMetadata} from "./form-metadata";
import { catchError, map, tap } from 'rxjs/operators';
import {Observable, of} from "rxjs";


// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export class FeedbackService {

  result: string;
  form:FormMetadata;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
  ) { }

  getFeedback():any {
    let feedback:Feedback = new Feedback()
    return feedback
  }

  async update(groupName:string, formId:string,  feedback: Feedback) {
    this.form = await this.getForm(groupName, formId);
    if (typeof this.form.feedbackItems === 'undefined') {
      this.form.feedbackItems = []
    }
    // delete the previous version
    let feedbackItem = this.form.feedbackItems.find(item => item.formItem === feedback.formItem && item.percentile === feedback.percentile)
    const filteredItems = this.form.feedbackItems.filter(item => item !== feedbackItem)
    this.form.feedbackItems = filteredItems
    this.form.feedbackItems.push(feedback)
    let formsJson = await this.http.get<Array<FormMetadata>>(`/editor/${groupName}/content/forms.json`).toPromise()
    const updatedFormsJson = formsJson.map(formInfo => {
      if (formInfo.id !== this.form.id) return Object.assign({}, formInfo)
      return Object.assign({}, formInfo, this.form)
    })
    let file = {
      groupId: groupName,
      filePath:`./forms.json`,
      fileContents: JSON.stringify(updatedFormsJson)
    }
    await this.http.post('/editor/file/save', file).toPromise()
    return this.form
  }

  async delete(groupName:string, formId:string,  formItem: string, percentile:number) {
    this.form = await this.getForm(groupName, formId);
    if (typeof this.form.feedbackItems !== 'undefined') {
      let feedbackItem = this.form.feedbackItems.find(item => item.formItem === formItem && item.percentile === percentile)
      const filteredItems = this.form.feedbackItems.filter(item => item !== feedbackItem)
      this.form.feedbackItems = filteredItems
    }
    let formsJson = await this.http.get<Array<FormMetadata>>(`/editor/${groupName}/content/forms.json`).toPromise()
    const updatedFormsJson = formsJson.map(formInfo => {
      if (formInfo.id !== this.form.id) return Object.assign({}, formInfo)
      return Object.assign({}, formInfo, this.form)
    })
    let file = {
      groupId: groupName,
      filePath:`./forms.json`,
      fileContents: JSON.stringify(updatedFormsJson)
    }
    await this.http.post('/editor/file/save', file).toPromise()
    return this.form
  }

  async edit(groupName:string, formId:string,  formItem: string, percentile:number) {
    this.form = await this.getForm(groupName, formId);
    let feedbackItem = this.form.feedbackItems.find(item => item.formItem === formItem && item.percentile === percentile)
    return feedbackItem
  }

  public async getForm(groupName: string, formId: string) {
    let formsJson = await this.http.get<Array<FormMetadata>>(`/editor/${groupName}/content/forms.json`).toPromise()
    let formMetadata:FormMetadata = formsJson.find(form => form.id === formId)
    return formMetadata;
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error("Error: " + error); // log to console instead

      // TODO: better job of transforming error for user consumption
      // this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /**
   * Creates an array of tangy-form-items; each item has an array of children elements populated with the item's children with a name attribute
   * @param formHtml
   * @returns {Promise<*[]>}
   */
  async createFormItemsList(formHtml) {

    let templateEl = document.createElement("template")
    templateEl.innerHTML = formHtml
    let items = Array.from(templateEl.content.querySelectorAll('tangy-form-item'));
    let curriculumForms = items.map(itemEl => {
      // @ts-ignore
      let obj = itemEl.getProps()
      // @ts-ignore
      let children = items.map(child =>  child.getProps())
      obj['children'] = children
      return obj
    })
    return curriculumForms
  }
}
