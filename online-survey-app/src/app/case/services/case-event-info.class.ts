import { Case } from '../classes/case.class';
import { CaseEvent } from '../classes/case-event.class';
import { CaseDefinition } from '../classes/case-definition.class';

 class CaseEventInfo extends CaseEvent {
caseInstance?:Case
caseDefinition?:CaseDefinition
constructor() {
super()
}
}
export {CaseEventInfo}
