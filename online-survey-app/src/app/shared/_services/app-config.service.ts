import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfig } from '../classes/app-config';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  constructor(private httpClient: HttpClient) { }
  async getAppConfig(): Promise<Partial<AppConfig>> {
    try {
      const data = await this.httpClient.get('./assets/app-config.json').toPromise() as AppConfig;
      return data;
    } catch (error) {
      console.error(error);
      return { appName: '' };
    }
  }

  async getAppName(): Promise<string>{
    return (await this.getAppConfig()).appName;
  }
}
