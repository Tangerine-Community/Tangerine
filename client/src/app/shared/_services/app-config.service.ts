import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../_classes/app-config.class';

@Injectable()
export class AppConfigService {
  constructor(
    private http: HttpClient
  ) { }
  async getAppConfig() {
    const res = <AppConfig>await this.http.get('./assets/app-config.json').toPromise();
    const appConfig:any = res;
    return appConfig;
  }
  public async getDefaultURL() {
    const result:any = await this.getAppConfig();
    return result.homeUrl;
  }
}
