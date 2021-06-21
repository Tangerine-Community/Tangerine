import { FormInfo } from './classes/form-info.class';
import { Inject, Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormVersion} from "./classes/form-version.class";

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

  async getFormTemplateMarkup(formId:string, formTemplateId:string):Promise<string> {
    const formInfo = await this.getFormInfo(formId)
    const formTemplate = formInfo.templates.find(formTemplate => formTemplate.id === formTemplateId)
    const formTemplateMarkup = await this.http.get(formTemplate.src, { responseType: 'text' }).toPromise()
    return formTemplateMarkup
  }
  
  getFoo() {
    return "foo"
  }

  async getFormSrc(formId, formVersionId:string = '') {
    const formInfo = await this.getFormInfo(formId)
    return formVersionId 
      ? formInfo.formVersions.find(formVersion => formVersion.id === formVersionId).src
      : formInfo.src
  }

}
