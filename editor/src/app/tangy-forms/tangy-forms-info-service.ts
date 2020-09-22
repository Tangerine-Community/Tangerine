import { FormInfo } from './classes/form-info.class';
import { Inject, Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TangyFormsInfoService {
  formsInfo: Array<FormInfo>
  formsMarkup: Array<any> = []
  constructor(
    private http: HttpClient
  ) { }

  async getFormsInfo() {
    this.formsInfo = this.formsInfo ? this.formsInfo : <Array<FormInfo>>await this.http.get('./assets/forms.json').toPromise()
    return this.formsInfo
  }

  async getFormInfo(id:string):Promise<FormInfo> {
    return (await this.getFormsInfo()).find(formInfo => formInfo.id === id)
  }

  async getFormMarkup(formId, revision:string) {
    const formInfo = await this.getFormInfo(formId)
    let key = revision ? formInfo.src + revision : formInfo.src;
    let formMarkup:any = this.formsMarkup[key]
    if (!this.formsMarkup[key]) {
      const revisionData =  formInfo.revisions.find(rev => rev['id'] === revision )
      let src = revision ? revisionData['src'] : formInfo.src
      formMarkup = await this.http.get(src, {responseType: 'text'}).toPromise()
      this.formsMarkup[key] = formMarkup;
    }
    return formMarkup
  }

  async getFormTemplateMarkup(formId:string, formTemplateId:string):Promise<string> {
    const formInfo = await this.getFormInfo(formId)
    const formTemplate = formInfo.templates.find(formTemplate => formTemplate.id === formTemplateId)
    const formTemplateMarkup = await this.http.get(formTemplate.src, { responseType: 'text' }).toPromise()
    return formTemplateMarkup
  }

}
