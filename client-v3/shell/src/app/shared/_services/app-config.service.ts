import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class AppConfigService {
  constructor(private http: Http) { }
  async getAppConfig() {
    const res = await this.http.get('../content/app-config.json').toPromise();
    const appConfig = await res.json();
    return appConfig;
  }
  public async getDefaultURL() {
    const result = await this.getAppConfig();
    return (result.homeUrl) ? result.homeUrl : 'case-management';
  }
}
