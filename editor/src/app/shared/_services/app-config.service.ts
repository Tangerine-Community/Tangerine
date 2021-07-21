import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  locationList:LocationList
  flatLocationList:FlatLocationList

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
