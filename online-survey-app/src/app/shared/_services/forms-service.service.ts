import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Form } from '../classes/form';
import { AppConfigService } from './app-config.service';
import { AuthenticationService } from 'src/app/core/auth/_services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class FormsService {

  constructor(
    private httpClient: HttpClient, 
    private appConfigService: AppConfigService,
    private authenticationService: AuthenticationService
  ) { }

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

  async getFormResponse(formResponseId: string): Promise<any> {
    try {
      const config = await this.appConfigService.getAppConfig();

      const headers = new HttpHeaders();
      headers.set('formUploadToken', config.uploadKey);
      const url = `/onlineSurvey/getResponse/${config.groupId}/${formResponseId}`;
      const data = await this.httpClient.get(url, {headers}).toPromise();

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  async getEventFormData(eventFormId: string): Promise<any> {
    try {
      const config = await this.appConfigService.getAppConfig();

      const headers = new HttpHeaders();
      headers.set('formUploadToken', config.uploadKey);
      const url = `/case/getEventFormData/${config.groupId}/${eventFormId}`;
      const data = await this.httpClient.get(url, {headers}).toPromise();

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  async uploadFormResponse(formResponse): Promise<boolean>{
    try {
      const config = await this.appConfigService.getAppConfig();

      // Set the groupId or it will be missing from the form
      // TODO: Move this logic to tangy-form so it happens for all responses
      formResponse.groupId = config.groupId

      const headers = new HttpHeaders();
      headers.set('formUploadToken', config.uploadKey);
      const data = await this.httpClient.post(config.formUploadURL, formResponse, {headers, observe: 'response'}).toPromise();
      return data.status === 200;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async uploadFormResponseForCase(formResponse, eventFormId): Promise<boolean>{
    try {
      const config = await this.appConfigService.getAppConfig();

      // Set the groupId or it will be missing from the form
      // TODO: Move this logic to tangy-form so it happens for all responses
      formResponse.groupId = config.groupId

      const headers = new HttpHeaders();
      const formUploadURL = `/onlineSurvey/saveResponse/${config.groupId}/${eventFormId}/${formResponse._id}`;
      headers.set('formUploadToken', config.uploadKey);
      const data = await this.httpClient.post(formUploadURL, formResponse, {headers, observe: 'response'}).toPromise();
      return data.status === 200;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
