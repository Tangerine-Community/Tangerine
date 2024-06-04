import { Injectable } from '@angular/core';
import { CaseDefinition } from '../classes/case-definition.class';
import { HttpClient } from '@angular/common/http';
import {FormInfo} from '../../tangy-forms/classes/form-info.class';

@Injectable({
  providedIn: 'root'
})
export class CaseDefinitionsService {
  caseDefinitionReferences:Array<any>
  caseDefinitions:Array<CaseDefinition>
  constructor(
    private http: HttpClient
  ) { }

  async load():Promise<any> {
    this.caseDefinitionReferences = this.caseDefinitionReferences ? this.caseDefinitionReferences : <Array<FormInfo>>await this.http.get('./assets/case-definitions.json').toPromise()
    if (!this.caseDefinitions) {
      this.caseDefinitions = []
      for (const reference of this.caseDefinitionReferences) {
        const definition = <CaseDefinition>await this.http.get(reference.src).toPromise();
        this.caseDefinitions.push(definition)
      }
    }
    return this.caseDefinitions;
  }

}
