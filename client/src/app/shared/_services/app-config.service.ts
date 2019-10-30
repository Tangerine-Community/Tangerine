import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../_classes/app-config.class';

@Injectable()
export class AppConfigService {
  config:AppConfig
  constructor(
    private http: HttpClient
  ) { }
  async getAppConfig():Promise<AppConfig> {
    this.config = <AppConfig>await this.http.get('./assets/app-config.json').toPromise();
    return this.config
  }
  public async getDefaultURL() {
    const result:any = await this.getAppConfig();
    return result.homeUrl;
  }
}
