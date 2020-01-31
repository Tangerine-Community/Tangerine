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
    return <Array<GroupDevice>>await this.httpClient.get(`/group-device-manage/list/${groupId}`).toPromise()
  }

  async getDevice(groupId:string, deviceId:string) {
    return <GroupDevice>await this.httpClient.get(`/group-device-manage/read/${groupId}/${deviceId}`).toPromise()
  }

  async updateDevice(groupId, device) {
    return <GroupDevice>await this.httpClient.post(`/group-device-manage/update/${groupId}`, {device}).toPromise()
  }

  async deleteDevice(groupId:string, deviceId:string) {
    return <GroupDevice>await this.httpClient.get(`/group-device-manage/delete/${groupId}/${deviceId}`).toPromise()
  }

  async resetDevice(groupId:string, deviceId:string) {
    return <GroupDevice>await this.httpClient.get(`/group-device-manage/reset/${groupId}/${deviceId}`).toPromise()
  }

  async createDevice(groupId) {
    const device = new GroupDevice()
    debugger
    return <GroupDevice>await this.httpClient.post(`/group-device-manage/create/${groupId}`, {body: {
      deviceData: device
    }}).toPromise()
  }

}
