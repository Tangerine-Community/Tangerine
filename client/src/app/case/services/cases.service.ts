import { Injectable } from '@angular/core';
import { UserService } from 'src/app/shared/_services/user.service';
import { Case } from '../classes/case.class';
import { CaseEventInfo } from './case-event-info.class';
import { CaseService } from './case.service';

@Injectable({
  providedIn: 'root'
})
export class CasesService {

  constructor(
    private userService: UserService,
    private caseService: CaseService
  ) { }

  async getEventsByDate(dateStart, dateEnd, excludeEstimates = false): Promise<Array<CaseEventInfo>> {
    const userDb = await this.userService.getUserDatabase(this.userService.getCurrentUser())
    const allDocs = await userDb.allDocs({ include_docs: true })
    const docs = <Array<CaseEventInfo>>(allDocs)
      .rows
      .map(row => row.doc)
      .filter(doc => doc.collection === 'TangyFormResponse' && doc.type === 'case')
      .reduce((acc, caseDoc) => [...acc, ...caseDoc.events
        .map(event => {
          return this.caseService.getCaseDefinitionByID(caseDoc.caseDefinitionId).then(caseDefinition => {
            return { ...event, caseInstance: caseDoc, caseDefinition }
          })
        })], <Array<CaseEventInfo>>[]);
    return Promise.all(docs).
    then(data => data.filter(eventInfo => this.doesOverlap(dateStart, dateEnd, eventInfo) && !(excludeEstimates && eventInfo.estimate))
      .sort(function (a, b) {
        const dateA = new Date(a.occurredOnDay || a.scheduledDay || a.estimatedDay || a.windowStartDay).getTime()
        const dateB = new Date(b.occurredOnDay || b.scheduledDay || b.estimatedDay || a.windowEndDay).getTime()
        return dateA - dateB;
      }))
  }

  private doesOverlap(dateStart, dateEnd, eventInfo: CaseEventInfo): boolean {
    const date = eventInfo.occurredOnDay || eventInfo.scheduledDay || eventInfo.estimatedDay
    // Return true if lower bound overlap, upper bound overlap, inside bounds, or encompassing bounds.
    return (date <= dateStart && dateStart <= date)
      || (date <= dateEnd && dateEnd <= date)
      || (date >= dateStart && dateEnd >= date)
      || (date <= dateStart && dateEnd <= date)
  }
}
