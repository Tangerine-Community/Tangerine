import { AppConfigService } from './../../shared/_services/app-config.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface AppInfo {
  serverUrl:string
  groupName:string
  groupId:string
  buildChannel:string
  tangerineVersion:string
  buildId:string
  assignedLocation:string
  versionTag:string
}

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor(
    private httpClient:HttpClient,
    private appConfigService:AppConfigService
  ) {
  }

  async getDevice() {
    return <any>{
      _id: 'server'
    }
  }


}
