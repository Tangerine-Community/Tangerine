import { FormInfo } from './classes/form-info.class';
import { Inject, Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TangerineFormInfo} from "../shared/_classes/tangerine-form.class";
import {FilesService} from "../groups/services/files.service";

@Injectable({
  providedIn: 'root'
})
export class TangyFormsInfoService {
  formsInfo: Array<FormInfo>
  formsMarkup: Array<any> = []
  constructor(
    private http: HttpClient,
    private filesService: FilesService
  ) { }

  async getFormsInfo(groupId:string) {
    // this.formsInfo = this.formsInfo ? this.formsInfo : <Array<FormInfo>>await this.http.get('./assets/forms.json').toPromise()
    this.formsInfo = this.formsInfo ? this.formsInfo : <Array<FormInfo>>await this.filesService.get(groupId, './forms.json')
    return this.formsInfo
  }

  async getFormInfo(id:string, groupId:string):Promise<FormInfo> {
    return (await this.getFormsInfo(groupId)).find(formInfo => formInfo.id === id)
  }

  async getFormTemplateMarkup(formId:string, formTemplateId:string, groupId:string):Promise<string> {
    const formInfo = await this.getFormInfo(formId, groupId)
    const formTemplate = formInfo.templates.find(formTemplate => formTemplate.id === formTemplateId)
    const formTemplateMarkup = await this.http.get(formTemplate.src, { responseType: 'text' }).toPromise()
    return formTemplateMarkup
  }

  async getFormSrc(formId, formVersionId:string = '', groupId:string) {
    const formInfo = await this.getFormInfo(formId, groupId)
    return formVersionId 
      ? formInfo.formVersions.find(formVersion => formVersion.id === formVersionId).src
      : formInfo.src
  }

}
