import { FormSearchSettings } from 'src/app/tangy-forms/classes/form-info.class';
import { FormInfo, FormTemplate } from './classes/form-info.class';
import { Inject, Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

// A dummy function so TS does not complain about our use of emit in our pouchdb queries.
const emit = (key, value) => {
  return true;
}

@Injectable({
  providedIn: 'root'
})
export class MockTangyFormsInfoService {
  formsInfo: Array<FormInfo>
  formsMarkup: Array<any> = []
  constructor(
    private http: HttpClient
  ) { }


  async getFormsInfo():Promise<Array<FormInfo>> {
    return [
      <FormInfo>{
        id: 'form1',
        title: 'Form 1',
        type: 'form',
        templates: [
          <FormTemplate>{
            id: 'foo',
            src: './form1/foo.html',
            label: "Foo"
          }
        ],
        searchSettings: <FormSearchSettings>{
          shouldIndex: true,
          variablesToIndex: ['foo', 'bar'],
          primaryTemplate: '${searchDoc.variables.foo}',
          secondaryTemplate: 'Id: ${searchDoc._id}'
        }
      },
      <FormInfo>{
        id: 'case1',
        title: 'Case 1',
        type: 'case',
        templates: [
          <FormTemplate>{
            id: 'foo',
            src: './case1/foo.html',
            label: "Foo"
          }
        ],
        searchSettings: <FormSearchSettings>{
          shouldIndex: true,
          variablesToIndex: ['foo', 'bar'],
          primaryTemplate: '${searchDoc.variables.foo} ${searchDoc.variables.bar}',
          secondaryTemplate: 'Id: ${searchDoc._id}'
        }
      }
    ]
  }

  async getFormInfo(id:string):Promise<FormInfo> {
    return <FormInfo>{
      id,
      src: "./foo/form.html",
      title: 'Foo'
    }
  }

  async getFormMarkup(formId) {
  
  }

  async getFormTemplateMarkup(formId, formTemplateId) {
    return `
      <h1>\${response.inputsByName.input1.value}</h1>
      <p>\${response.inputsByName.input2.value}</p>
    `
  }

}
