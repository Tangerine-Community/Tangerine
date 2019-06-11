import { FormInfo, FormSearchSettings } from "src/app/tangy-forms/classes/form-info.class";

export class MockTangyFormsInfoService {
  async getFormsInfo():Promise<Array<FormInfo>> {
    return [
      <FormInfo>{
        id: 'form1',
        title: 'Form 1',
        type: 'form',
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
        searchSettings: <FormSearchSettings>{
          shouldIndex: true,
          variablesToIndex: ['foo', 'bar'],
          primaryTemplate: '${searchDoc.variables.foo} ${searchDoc.variables.bar}',
          secondaryTemplate: 'Id: ${searchDoc._id}'
        }
      }
    ]
  }
}
