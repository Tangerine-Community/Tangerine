import { UserService } from './../../shared/_services/user.service';
import { Injectable } from '@angular/core';
import { CaseService } from './case.service';
import { CaseEvent } from '../classes/case-event.class';
import { CaseEventOperation } from '../classes/case-event-definition.class';

@Injectable({
  providedIn: 'root'
})
export class CasesService {

  constructor(
    private caseService: CaseService,
    private userService:UserService
  ) { }

  async getEventsByDate(dateStart:string, dateEnd:string, excludeEstimates = false): Promise<Array<CaseEvent>> {
    const db = await this.userService.getUserDatabase()
    const queryResults = await db.query('case-events-by-all-days', { start_key: dateStart, end_key: dateEnd })
    const caseEvents = []
    for (let row of queryResults.rows) {
      await this.caseService.load(row.value.caseId)
      let caseEvent = this.caseService.case.events.find(event => event.id === row.value.eventId)
      const eventDefinition = this.caseService.caseDefinition.eventDefinitions.find(ed => ed.id === caseEvent.caseEventDefinitionId)
      if (this.caseService.hasCaseEventPermission(CaseEventOperation.READ, eventDefinition)) {
        caseEvents.push(caseEvent)
      }
    }
    return caseEvents
  }

}
