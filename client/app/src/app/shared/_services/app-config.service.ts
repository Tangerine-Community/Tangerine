import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AppConfigService {
  constructor(
    private http: HttpClient
  ) { }
  async getAppConfig() {
    const res = await this.http.get('./assets/app-config.json').toPromise();
    const appConfig:any = res;
    return appConfig;
  }
  public async getDefaultURL() {
    const result:any = await this.getAppConfig();
    return result.homeUrl;
  }
}
