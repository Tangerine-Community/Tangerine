import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GroupDevice } from '../classes/group-device.class';

@Injectable({
  providedIn: 'root'
})
export class GroupDevicesService {

  constructor(
    private httpClient:HttpClient
  ) { }

  async list(groupId:string) {
    return <Array<GroupDevice>>await this.httpClient.get(`/group-device/list/${groupId}`).toPromise()
  }

  async getDevice(groupId:string, deviceId:string) {
    return <GroupDevice>await this.httpClient.get(`/group-device/read/${groupId}/${deviceId}`).toPromise()
  }

  async updateDevice(groupId, device) {
    return <GroupDevice>await this.httpClient.post(`/group-device/update/${groupId}`, {device}).toPromise()
  }

  async deleteDevice(groupId:string, deviceId:string) {
    return <GroupDevice>await this.httpClient.get(`/group-device/delete/${groupId}/${deviceId}`).toPromise()
  }

  async resetDevice(groupId:string, deviceId:string) {
    return <GroupDevice>await this.httpClient.get(`/group-device/reset/${groupId}/${deviceId}`).toPromise()
  }

  async createDevice(groupId) {
    const device = new GroupDevice()
    return <GroupDevice>await this.httpClient.post(`/group-device/create/${groupId}`, {body: {
      deviceData: device
    }}).toPromise()
  }

}
