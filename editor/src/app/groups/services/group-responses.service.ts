import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GroupResponsesService {

  constructor(
    private httpClient:HttpClient
  ) { }

  async list(groupId:string) {
    return <Array<any>>await this.httpClient.get(`/group-responses/list/${groupId}`).toPromise()
  }

  async query(groupId:string, query:any) {
    return <Array<any>>await this.httpClient.post(`/group-responses/query/${groupId}`, { query }).toPromise()
  }

  async getResponse(groupId:string, deviceId:string) {
    return <any>await this.httpClient.get(`/group-responses/read/${groupId}/${deviceId}`).toPromise()
  }

  async updateResponse(groupId, device) {
    return <any>await this.httpClient.post(`/group-responses/update/${groupId}`, {device}).toPromise()
  }

  async deleteResponse(groupId:string, deviceId:string) {
    return <any>await this.httpClient.get(`/group-responses/delete/${groupId}/${deviceId}`).toPromise()
  }

  async createResponse(groupId, response:any = {}) {
    return <any>await this.httpClient.post(`/group-responses/create/${groupId}`, {body: {
      responseData: response 
    }}).toPromise()
  }
}
