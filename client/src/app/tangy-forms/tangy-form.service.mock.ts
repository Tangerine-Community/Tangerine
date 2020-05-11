import { Injectable } from '@angular/core';
import { UserService } from '../shared/_services/user.service';
import { HttpClient } from '@angular/common/http';
import { FormInfo } from './classes/form-info.class';
import {TangyFormResponseModel} from 'tangy-form/tangy-form-response-model.js'
import {TangyFormsInfoService} from './tangy-forms-info-service';


@Injectable({
  providedIn: 'root'
})
export class MockTangyFormService {

  formsInfo: Array<FormInfo>
  formsMarkup: Array<any> = []
  formInputs: Array<any> = []

  constructor(
  ) { }

  async getFormMarkup(formId) {
  
  }

  async saveForm(formDoc) {
    
  }

  async saveResponse(responseDoc) {
   
  }

  async getResponse(responseId) {
    return new TangyFormResponseModel({
      _id: responseId,
      form: {
        id: 'form1'
      },
      items: [
        {
          id: 'item1',
          inputs: [
            {
              name: 'input1',
              value: 'This is input1.'
            },
            {
              name: 'input2',
              value: 'This is input2.'
            }
          ]
        }
      ]
    })
  }

  async getAllResponses() {
  }

  async getResponsesByFormId(formId) {
  }

  async getResponsesByLocationId(locationId) {
  }

}
