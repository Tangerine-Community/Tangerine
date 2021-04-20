import { CaseRole } from './case-role.class';
import { CaseEventDefinition } from './case-event-definition.class'

class CaseDefinition {

  id:string
  formId:string
  name:string
  caseRoles?:Array<CaseRole>
  description?:string
  eventDefinitions: Array<CaseEventDefinition> = []
  templateBreadcrumbText?:string 
  templateCaseTitle?:string 
  templateCaseDescription?:string 
  templateCaseEventListItemIcon?:string 
  templateCaseEventListItemPrimary?:string 
  templateCaseEventListItemSecondary?:string 
  templateEventFormListItemIcon?:string 
  templateEventFormListItemPrimary?:string 
  templateEventFormListItemSecondary?:string 
  startFormOnOpen?: CaseFormPath
  templateScheduleListItemIcon?:string
  templateScheduleListItemPrimary?:string
  templateScheduleListItemSecondary?:string
  onCaseOpen?:string
  onCaseClose?:string
  constructor(init:any) {
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

class CaseFormPath {
  eventId:string
  eventFormId:string
}

export { CaseDefinition }