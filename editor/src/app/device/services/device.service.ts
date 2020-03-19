import { AppConfigService } from './../../shared/_services/app-config.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

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
