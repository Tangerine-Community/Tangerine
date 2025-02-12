import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfig } from '../classes/app-config';
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

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  locationList:LocationList
  flatLocationList:FlatLocationList

  constructor(private httpClient: HttpClient) { }
  async getAppConfig(): Promise<Partial<AppConfig>> {
    try {
      const data = await this.httpClient.get('./assets/app-config.json').toPromise() as AppConfig;
      return data;
    } catch (error) {
      console.error(error);
      return { appName: '' };
    }
  }

  async getAppName(): Promise<string>{
    return (await this.getAppConfig()).appName;
  }

  async getFlatLocationList() {
    this.locationList = this.locationList || <LocationList>await this.httpClient.get('./assets/location-list.json').toPromise();
    this.flatLocationList = this.flatLocationList || <FlatLocationList>Loc.flatten(JSON.parse(JSON.stringify(this.locationList)))
    return this.flatLocationList
  }
}
