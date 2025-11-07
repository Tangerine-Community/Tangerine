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
  async getAppConfig(groupId: string): Promise<Partial<AppConfig>> {
    try {
      //const data = await this.httpClient.get('../online-survey-apps/group-fe276398-8c33-4a08-bd00-702b9bf1f882/form-f194254d-553e-40d2-bc64-9970581a92fd/assets/app-config.json').toPromise() as AppConfig;
      const data = await this.httpClient.get(`/app/${groupId}/assets/app-config.json`).toPromise() as AppConfig;
      return data;
    } catch (error) {
      console.error(error);
      return { appName: '' };
    }
  }

  async getFlatLocationList() {
    this.locationList = this.locationList || <LocationList>await this.httpClient.get('./assets/location-list.json').toPromise();
    this.flatLocationList = this.flatLocationList || <FlatLocationList>Loc.flatten(JSON.parse(JSON.stringify(this.locationList)))
    return this.flatLocationList
  }
}
