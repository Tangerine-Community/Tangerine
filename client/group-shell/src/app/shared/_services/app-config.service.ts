import { Injectable } from '@angular/core';

@Injectable()
export class AppConfigService {
  constructor() { }
  async getAppConfig() {
    const res = await fetch('/content/app-config.json');
    const appConfig = await res.json();
    return appConfig;
  }
  public async getDefaultURL() {
    const result = await this.getAppConfig();
    return (result.homeUrl) ? result.homeUrl : 'case-management';
  }
}
