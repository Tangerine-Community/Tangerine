import { CASE_EVENT_STATUS_COMPLETED } from './../../classes/case-event.class';
import { Component, OnInit } from '@angular/core';
import { CaseService } from '../../services/case.service';
import { CaseEvent } from '../../classes/case-event.class';
import { CaseEventInfo } from '../../classes/case-event-info.class';
import { CaseEventDefinition } from '../../classes/case-event-definition.class';


@Component({
  selector: 'app-case-events-review',
  templateUrl: './case-events-review.component.html',
  styleUrls: ['./case-events-review.component.css']
})
export class CaseEventsReviewComponent implements OnInit {

  caseEventInfos:Array<CaseEventInfo>
  ready = false

  constructor(
    private caseService:CaseService
  ) { }

  async ngOnInit() {
    this.caseEventInfos = await this.caseService.getCaseEventInfosByStatus(CASE_EVENT_STATUS_COMPLETED)
    this.ready = true
  }

}
