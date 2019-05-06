import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormInfo } from '../_classes/form-info.class';

@Injectable({
  providedIn: 'root'
})
export class FormsInfoService {

  constructor(
    private http: HttpClient
  ) { }

  async getFormsInfo():Promise<Array<FormInfo>> {
    return await this.http.get<Array<FormInfo>>('./assets/forms.json').toPromise()
  }

  async saveFormsInfo(updatedFormsInfo:Array<FormInfo>) {
    return await this.http.put<Array<FormInfo>>('./assets/forms.json', updatedFormsInfo).toPromise()
  }

  async getFormInfo(formId:string):Promise<FormInfo> {
    return (await this.getFormsInfo()).find(formInfo => formInfo.id === formId)
  }

  async saveFormInfo(updatedFormInfo:FormInfo) {
    const formsInfo = await this.getFormsInfo()
    const updatedFormsInfo = formsInfo.map(formInfo => formInfo.id === updatedFormInfo.id ? updatedFormInfo : formInfo)
    await this.saveFormsInfo(updatedFormsInfo)
  }

}
