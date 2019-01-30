import { Component, OnInit, AfterContentInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/auth/_services/user.service';
import { CaseService } from '../../services/case.service'
import { CaseEvent } from '../../classes/case-event.class'
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import { EventForm } from '../../classes/event-form.class';

class EventFormDefinitionInfo {
  eventFormDefinitionId: string
  name:string
  canStart:boolean
  required: boolean
  eventForms:Array<EventForm>
}

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit, AfterContentInit {

  caseService:CaseService
  caseEvent:CaseEvent
  caseEventDefinition: CaseEventDefinition
  eventFormsInfo:Array<EventFormDefinitionInfo>


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
      this.eventFormsInfo = this
        .caseEventDefinition
        .eventFormDefinitions
        .map(eventFormDefinition => {
          return <EventFormDefinitionInfo>{
            eventFormDefinitionId: eventFormDefinition.id,
            name: eventFormDefinition.name,
            required: eventFormDefinition.required,
            canStart: this.caseEvent.eventForms.filter(eventForm => eventForm.eventFormDefinitionId === eventFormDefinition.id).length === 0 || eventFormDefinition.repeatable
              ? true
              : false,
            eventForms: this
              .caseEvent
              .eventForms
              .filter(eventFormResponse => eventFormResponse.eventFormDefinitionId === eventFormDefinition.id)
          }
        })
    })
  }

  async startEventForm(eventFormDefinitionId:string) {
    // Make this function...
    const eventForm = await this.caseService.startEventForm(this.caseEvent.id, eventFormDefinitionId)
    // Then navigate
    this.router.navigate(['case', 'event', 'form', eventForm.caseId, eventForm.caseEventId, eventForm.id])
  }

}
