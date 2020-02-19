import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ServerConfigService {
  constructor(
    private http: HttpClient
  ) { }
  async getServerConfig() {
    const res = await this.http.get(`/config`).toPromise();
    const appConfig:any = res;
    return appConfig;
  }
}
