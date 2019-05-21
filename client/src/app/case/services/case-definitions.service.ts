import { Injectable } from '@angular/core';
import { CaseDefinition } from '../classes/case-definition.class';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CaseDefinitionsService {

  constructor(
    private http: HttpClient
  ) { }

  async load():Promise<any> {
    const caseDefinitionReferences = <Array<any>>await this.http.get('./assets/case-definitions.json').toPromise()
    const caseDefinitions = []
    for (const reference of caseDefinitionReferences) {
      caseDefinitions.push(<CaseDefinition>await this.http.get(reference.src).toPromise())
    }
    return caseDefinitions;
  }

}
