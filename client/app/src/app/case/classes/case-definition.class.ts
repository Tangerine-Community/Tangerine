import { CaseEventDefinition } from './case-event-definition.class'

class CaseDefinition {

  id:string
  revision:string
  name:string
  description:string
  eventDefinitions: Array<CaseEventDefinition> = []

  constructor(init:CaseDefinition) {
    Object.assign(this, init);
    /*
    this.id = caseDefinitionData.id;
    this.revision = caseDefinitionData.revision;
    this.name = caseDefinitionData.name;
    this.eventDefinitions = caseDefinitionData
      .eventDefinitions
      .map(eventDefinition => new CaseEventDefinition(eventDefinition))
    */
  }

}

export { CaseDefinition }