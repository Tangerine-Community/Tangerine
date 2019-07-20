import { Injectable } from '@angular/core';
import { Query } from '../classes/query.class';
import { UserService } from 'src/app/shared/_services/user.service';
import { TangyFormService } from 'src/app/tangy-forms/tangy-form-service';
import { CaseService } from 'src/app/case/services/case.service';
import { CaseEvent } from '../classes/case-event.class';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { WindowRef } from 'src/app/core/window-ref.service';
import moment from 'moment/src/moment';

@Injectable({
  providedIn: 'root'
})
export class QueriesService {
  caseEvent: CaseEvent
  tangyFormService: TangyFormService
  window: any
  queryCaseEventDefinitionId: any
  queryEventFormDefinitionId: any
  queryFormId: any

  constructor(
    private userService: UserService,
    private caseService: CaseService,
    private windowRef: WindowRef
  ) {
    this.window = this.windowRef.nativeWindow
    this.queryCaseEventDefinitionId = 'event-definition-abcde';
    this.queryEventFormDefinitionId = 'event-form-definition-68954';
    this.queryFormId = 'query-999999';
  }

  async getQueries (): Promise<Array<Query>> {
    const userDbName = this.userService.getCurrentUser();
    const tangyFormService = new TangyFormService({ databaseName: userDbName });
    const queryForms = await tangyFormService.getResponsesByFormId(this.queryFormId);
    const queries = Array<Query>();
    for (const queryForm of queryForms) {
      const query = Object.create(Query);
      queryForm.items[0].inputs.map(q => (query[q.name] = q.value));
      if (query.queryStatus === 'Open') {
        queries.push(query);
      }
    }
    return queries;
  }

  async getOpenQueriesCount (): Promise<number> {
    return (await this.getQueries()).length;
  }

  async createQuery (
    { caseId, queryId, associatedCaseId, associatedCaseType, associatedEventId,
      associatedFormId, associatedEventName, associatedFormName,
      associatedFormLink, associatedCaseName, associatedVariable,
      queryTypeId, queryLink, queryDate, queryText, queryStatus,
      queryResponse, queryResponseDate }
      ): Promise<string> {
    await this.caseService.load(caseId);
    let caseEvent = this.caseService.case.events
      .find(caseEventInfo => caseEventInfo.caseEventDefinitionId === this.queryCaseEventDefinitionId);

    if (caseEvent === undefined) {
        const newDate = moment(new Date(), 'YYYY-MM-DD').unix() * 1000;
        caseEvent = this.caseService.createEvent(this.queryCaseEventDefinitionId);
        await this.caseService.scheduleEvent(caseEvent.id, newDate, newDate);
        await this.caseService.save();
      } else {
        caseEvent = this.caseService.case.events
        .find(caseEventInfo => caseEventInfo.caseEventDefinitionId === this.queryCaseEventDefinitionId);
      }

      const c = this.caseService.startEventForm(caseEvent.id, this.queryEventFormDefinitionId);
      await this.caseService.save();

      caseEvent = this.caseService.case.events.find(c => c.caseEventDefinitionId === this.queryCaseEventDefinitionId);
      const eventForm = caseEvent.eventForms.find(d => d.id === c.id);

      const userDbName = this.userService.getCurrentUser();
      const tangyFormService = new TangyFormService({ databaseName: userDbName });

      const tangyFormContainerEl = this.window.document.createElement('div');
      tangyFormContainerEl.innerHTML = await tangyFormService.getFormMarkup(this.queryFormId);
      const tangyFormEl = tangyFormContainerEl.querySelector('tangy-form') ;
      tangyFormEl.style.display = 'none';
      this.window.document.body.appendChild(tangyFormContainerEl);

      tangyFormEl.newResponse();

      tangyFormEl.response.items[0].inputs = [
        { name: 'associatedCaseType', value: associatedCaseType },
        { name: 'associatedCaseId', value: associatedCaseId },
        { name: 'associatedEventId', value: associatedEventId },
        { name: 'associatedFormId', value: associatedFormId },
        { name: 'associatedCaseName', value: associatedCaseName },
        { name: 'associatedEventName', value: associatedEventName },
        { name: 'associatedFormName', value: associatedFormName },
        { name: 'associatedFormLink', value: associatedFormLink },
        { name: 'associatedVariable', value: associatedVariable },
        { name: 'queryId', value: queryId },
        { name: 'queryTypeId', value: queryTypeId },
        { name: 'queryDate', value: queryDate },
        { name: 'queryText', value: queryText },
        { name: 'queryResponse', value: queryResponse },
        { name: 'queryResponseDate', value: queryResponseDate },
        { name: 'queryStatus', value: queryStatus },
        { name: 'queryLink', value: queryLink }
      ];

      tangyFormEl.store.dispatch({ type: 'FORM_RESPONSE_COMPLETE' });

      await tangyFormService.saveResponse(tangyFormEl.response);
      const queryResponseId = tangyFormEl.response._id;
      eventForm.formResponseId = queryResponseId;
      await this.caseService.save();

      return queryResponseId;
    }
}

