import { CaseDefinition } from '../classes/case-definition.class'
import axios from 'axios';
export class CaseDefinitionsService {
  async load():Promise<any> {
    const response = await axios.get('./assets/case-definitions.json');
    const caseDefinitionReferences = response.data;
    const caseDefinitions = [];
    for (const reference of caseDefinitionReferences) {
      const response = await axios.get(reference.src)
      caseDefinitions.push(new CaseDefinition(response.data));
    }
    return caseDefinitions;
  }
}
