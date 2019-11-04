import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AboutService {

  constructor(
    private http:HttpClient
  ) { }

  getBuildNumber():Promise<string> {
    return this.http.get('./assets/tangerine-build-id', {responseType: 'text'}).toPromise()
  }

}
