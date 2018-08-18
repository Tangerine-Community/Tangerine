import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AppConfigService {
  constructor(
    private http: HttpClient
  ) { }
  async getAppConfig(groupName) {
    const res = await this.http.get(`/editor/${groupName}/content/app-config.json`).toPromise();
    const appConfig:any = res;
    return appConfig;
  }
  public async getDefaultURL(groupName) {
    const result:any = await this.getAppConfig(groupName);
    return result.homeUrl;
  }
}
