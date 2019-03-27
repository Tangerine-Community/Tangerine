import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../_models/app-config.model';

@Injectable()
export class AppConfigService {
  constructor(
    private http: HttpClient
  ) { }
  async getAppConfig() {
    return <AppConfig>await this.http.get('./assets/app-config.json').toPromise();
  }
  public async getDefaultURL() {
    const result:any = await this.getAppConfig();
    return result.homeUrl;
  }
}
