import { TangyFormService } from 'src/app/tangy-forms/tangy-form.service';
import { Injectable } from '@angular/core';
import { CaseEventInfo } from './case-event-info.class';
import { CaseService } from './case.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class CasesService {

  constructor(
    private caseService: CaseService,
    private tangyFormService:TangyFormService
  ) { }

  async getEventsByDate(dateStart, dateEnd, excludeEstimates = false): Promise<Array<CaseEventInfo>> {
    const allResponses = await this.tangyFormService.getAllResponses()
    const docs = <Array<CaseEventInfo>>(allResponses)
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
    // Only show items on schedule view if the following dates are set on the event
    if (!(eventInfo.scheduledDay || eventInfo.estimatedDay || eventInfo.windowStartDay)){
      return false;
    }
    dateStart = moment(new Date(dateStart)).format('YYYY-MM-DD')
    dateEnd = moment(new Date(dateEnd)).format('YYYY-MM-DD')
    return moment(eventInfo.scheduledDay || eventInfo.estimatedDay || eventInfo.windowStartDay).isBetween(dateStart, dateEnd, 'days', '[]')
    || moment(eventInfo.scheduledDay || eventInfo.estimatedDay ||eventInfo.windowEndDay).isBetween(dateStart, dateEnd, 'days', '[]')
  }
}
