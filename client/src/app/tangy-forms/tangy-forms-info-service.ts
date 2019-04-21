import PouchDB from 'pouchdb';
import {TangyFormResponseModel} from 'tangy-form/tangy-form-response-model.js'
import axios from 'axios'
import { FormInfo } from './classes/form-info.class';
import { Inject, Injectable } from '@angular/core';

// A dummy function so TS does not complain about our use of emit in our pouchdb queries.
const emit = (key, value) => {
  return true;
}

@Injectable({
  providedIn: 'root'
})
export class TangyFormsInfoService {

  async getFormsInfo() {
    const formsInfo:Array<FormInfo> = (await axios.get('./assets/forms.json')).data
    return formsInfo
  }

}
