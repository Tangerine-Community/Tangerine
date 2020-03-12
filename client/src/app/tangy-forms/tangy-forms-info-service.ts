import { FormInfo } from './classes/form-info.class';
import { Inject, Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

// A dummy function so TS does not complain about our use of emit in our pouchdb queries.
const emit = (key, value) => {
  return true;
}

@Injectable({
  providedIn: 'root'
})
export class TangyFormsInfoService {
  formsInfo: Array<FormInfo>
  constructor(
    private http: HttpClient
  ) { }
  async getFormsInfo() {
    this.formsInfo = this.formsInfo ? this.formsInfo : <Array<FormInfo>>await this.http.get('./assets/forms.json').toPromise()
    return this.formsInfo
  }

}
