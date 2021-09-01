import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../_classes/app-config.class';

@Injectable()
export class AppConfigService {
  config:AppConfig
  locationList:any
  constructor(
    private http: HttpClient
  ) { }
  async getAppConfig():Promise<AppConfig> {
    this.config = this.config ? this.config : <AppConfig>await this.http.get('./assets/app-config.json').toPromise();
    return this.config;
  }
  public async getDefaultURL() {
    const result:any = await this.getAppConfig();
    return result.homeUrl;
  }
  public async syncProtocol2Enabled() {
    const config = await this.getAppConfig()
    return config.syncProtocol === '2' ? true : false
  }
  async getLocationList():Promise<any> {
    this.locationList = this.locationList ? this.locationList : await this.http.get('./assets/location-list.json').toPromise();
    return this.locationList;
  }


}
