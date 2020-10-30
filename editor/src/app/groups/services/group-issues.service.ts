import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GroupIssuesService {

  constructor(
    private httpClient:HttpClient
  ) { }

  async query(groupId:string, options:any) {
    return <Array<any>>await this.httpClient.post(`/group-issues/query/${groupId}`, { options }).toPromise()
  }
  
}
