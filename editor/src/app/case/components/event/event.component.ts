import { EventFormDefinition } from './../../classes/event-form-definition.class';

import { Component, OnInit, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseService } from '../../services/case.service'
import { CaseEvent } from '../../classes/case-event.class'
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import { EventForm } from '../../classes/event-form.class';

interface EventFormInfo {
  eventFormDefinition:EventFormDefinition
  eventForm:EventForm
}

interface ParticipantInfo {
  id: string
  renderedListItem:string
  availableEventFormDefinitionsForParticipant: Array<string>
  newFormLink:string
  eventFormInfos: Array<EventFormInfo>
}

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit, AfterContentInit {

  caseEvent:CaseEvent
  caseEventDefinition: CaseEventDefinition
  participantInfos:Array<ParticipantInfo>
  noRoleEventFormInfos: Array<EventFormInfo>
  loaded = false
  availableEventFormDefinitions:Array<EventFormDefinition> = []
  selectedNewEventFormDefinition = ''
  window:any

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseService: CaseService,
    private ref: ChangeDetectorRef
  ) { 
    ref.detach()
    this.window = window
  }

  ngOnInit() {
  }

  async ngAfterContentInit() {
    this.route.params.subscribe(async params => {
      await this.caseService.load(params.caseId)
      this.caseService.setContext(params.eventId)
      this.window.caseService = this.caseService
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
      const noRoleEventFormDefinitionIds:Array<string> = this.caseEventDefinition.eventFormDefinitions
        .filter(eventFormDefinition => !eventFormDefinition.forCaseRole)
        .map(eventFormDefinition => eventFormDefinition.id)
      this.noRoleEventFormInfos = this
        .caseEvent
        .eventForms
        .filter(eventForm => noRoleEventFormDefinitionIds.includes(eventForm.eventFormDefinitionId))
        .map(eventForm => {
          return <EventFormInfo>{
            eventForm,
            eventFormDefinition: this
              .caseEventDefinition
              .eventFormDefinitions
              .find(eventFormDefinition => eventFormDefinition.id === eventForm.eventFormDefinitionId)
          }
        })
      this.loaded = true
      this.ref.detectChanges()
    })
  }

}
