import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../_classes/app-config.class';
import { Loc } from 'tangy-form/util/loc.js'

export interface LocationNode {
  id:string
  level:string
  label:string
  data:any
}

export interface LocationList {
  locations:any
  locationsLevels:Array<string>
  metadata:any
}

export interface FlatLocationList {
  locations:Array<LocationNode>
  locationsLevels:Array<string>
  metadata:any
}

@Injectable()
export class AppConfigService {

  config:AppConfig
  locationList:LocationList
  flatLocationList:FlatLocationList

  constructor(
    private http: HttpClient
  ) { }

  async getAppConfig():Promise<AppConfig> {
    this.config = this.config ? this.config : new AppConfig(await this.http.get('./assets/app-config.json').toPromise())
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
    this.locationList = this.locationList ? this.locationList : <LocationList>await this.http.get('./assets/location-list.json').toPromise();
    return this.locationList;
  }

  async getFlatLocationList() {
    this.locationList = this.locationList || <LocationList>await this.http.get('./assets/location-list.json').toPromise();
    this.flatLocationList = this.flatLocationList || <FlatLocationList>Loc.flatten(JSON.parse(JSON.stringify(this.locationList)))
    return this.flatLocationList
  }

}
