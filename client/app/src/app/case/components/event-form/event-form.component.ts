import { Component, OnInit, AfterContentInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/auth/_services/user.service';
import { CaseService } from '../../services/case.service'
import { EventForm } from '../../classes/event-form.class';
import { CaseEvent } from '../../classes/case-event.class';
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import { EventFormDefinition } from '../../classes/event-form-definition.class';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit, AfterContentInit {
  caseService:CaseService
  caseEvent: CaseEvent
  caseEventDefinition: CaseEventDefinition
  eventForm: EventForm 
  eventFormDefinition: EventFormDefinition
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) { }
  ngOnInit() {
  }
  async ngAfterContentInit() {
    this.route.params.subscribe(async params => {
      this.caseService = new CaseService()
      await this.caseService.load(params.caseId)
      this.caseEvent = this
        .caseService
        .case
        .events
        .find(caseEvent => caseEvent.id === params.eventId)
      this.caseEventDefinition = this
        .caseService
        .caseDefinition
        .eventDefinitions
        .find(caseDef => caseDef.id === this.caseEvent.caseEventDefinitionId)
      this.eventForm = this.caseEvent.eventForms.find(eventForm => eventForm.id === params.eventFormId)
      this.eventFormDefinition = this
        .caseEventDefinition
        .eventFormDefinitions
        .find(eventFormDefinition => eventFormDefinition.id === this.eventForm.eventFormDefinitionId)

    })
  }
 
}
