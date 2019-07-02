import { Component, OnInit, AfterContentInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../shared/_services/user.service';
import { CaseService } from '../../services/case.service';
import { CaseEvent } from '../../classes/case-event.class';
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import { EventForm } from '../../classes/event-form.class';
import { EventFormDefinition } from '../../classes/event-form-definition.class';
import { WindowRef } from 'src/app/core/window-ref.service';
import { QueriesService } from '../../services/queries.service';

class QueryFormInfo {
  id:string;
  caseId:string;
  caseEventId:string;
  eventFormDefinitionId: string;
  name: string;
  required: boolean;
  eventForm: EventForm;
}

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css']
})

export class QueryComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
