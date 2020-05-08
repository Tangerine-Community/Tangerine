import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AppConfigService {
  constructor(
    private http: HttpClient
  ) { }
  async getAppConfig(groupId = '') {
    if (groupId) {
      const res = await this.http.get(`/editor/${groupId}/content/app-config.json`).toPromise();
      const appConfig:any = res;
      return appConfig;
    } else {
      const res = await this.http.get(`./assets/app-config.json`).toPromise();
      const appConfig:any = res;
      return appConfig;
    }
  }
  public async getDefaultURL(groupName) {
    const result:any = await this.getAppConfig(groupName);
    return result.homeUrl;
  }
  async getTranslations() {
    try {
      return await this.http.get('assets/translation.json').toPromise();
    } catch (error) {
      console.error(error);
    }
  }
}
