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
  original:  `<tangy-form
  id="registration-role-1"
  title="Role 1 Registration"
  >
    <tangy-form-item
    id="item1"
    title="Screening">
    <tangy-input name="first_name" label="First name" required></tangy-input>
    </tangy-form-item>
  <tangy-form-item
    id="item2"
    title="Registration">
    <tangy-input name="participant_id" label="Participant ID" disabled></tangy-input>
    </tangy-form-item>
    <tangy-form-item id="item4" title="Conclude">
    <tangy-box name="conclusion_message">
      Thank you for your time. This form may now be submitted.
    </tangy-box>
  </tangy-form-item>
</tangy-form>`
  
  constructor(
    private tangyFormsInfoService: TangyFormsInfoService
  ) { }

  async getFormMarkup(formId, formVersionId:string = '') {
    let forms = {
      "original": this.original
    }
    let formMarkup:any
    // = this.formsMarkup[key]
    // if (!this.formsMarkup[key]) {
    const foo = this.tangyFormsInfoService.getFoo()
    let src: string = await this.tangyFormsInfoService.getFormSrc(formId, formVersionId)

    // formMarkup = await this.http.get(src, {responseType: 'text'}).toPromise()
    formMarkup = forms[src]
    // formMarkup = forms["foo"]

    return formMarkup
    
    console.log("mocking getFormMarkup")
    
    // return forms[formId]
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
