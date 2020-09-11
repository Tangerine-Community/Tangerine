import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Form } from '../classes/form';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class FormsServiceService {

  constructor(private httpClient: HttpClient, private appConfigService: AppConfigService) { }

  async getForms(): Promise<Form[]> {
    try {
      return await this.httpClient.get('./assets/forms.json').toPromise() as Form[];
    } catch (error) {
      console.error(error);
    }
  }

  async getFormById(formId: string): Promise<Form> {
    try {
      return (await this.getForms()).find(e => e.id === formId);
    } catch (error) {
      console.error(error);
    }
  }

  async getFormMarkUpById(formId): Promise<string> {
    try {
      const formSrc = (await (this.getFormById(formId))).src;
      return await this.httpClient.get(formSrc, { responseType: 'text' }).toPromise();
    } catch (error) {
      console.error(error);
    }
  }

  async uploadFormResponse(formResponse): Promise<boolean>{
    try {
      const uploadURL = (await this.appConfigService.getAppConfig()).formUploadURL;
      const data = await this.httpClient.post(uploadURL, formResponse, {observe: 'response'}).toPromise();
      return data.status === 200;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
