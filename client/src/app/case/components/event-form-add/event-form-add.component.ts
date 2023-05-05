import { EventFormDefinition, EventFormOperation } from './../../classes/event-form-definition.class';
import { Component, OnInit, AfterContentInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseService } from '../../services/case.service'
import { CaseEvent } from '../../classes/case-event.class'
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import { EventForm } from '../../classes/event-form.class';

interface EventFormInfo {
  eventFormDefinition:EventFormDefinition
  eventForm:EventForm
}

@Component({
  selector: 'app-event-form-add',
  templateUrl: './event-form-add.component.html',
  styleUrls: ['./event-form-add.component.css']
})
export class EventFormAddComponent implements AfterContentInit {

  caseEvent:CaseEvent
  caseEventDefinition: CaseEventDefinition
  noRoleEventFormInfos: Array<EventFormInfo>
  loaded = false
  availableEventFormDefinitions:Array<EventFormDefinition> = []
  selectedNewEventFormDefinition = ''
  selectedParticipant = ''
  window:any

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseService: CaseService
  ) {
    this.window = window
  }


  async ngAfterContentInit() {
    this.route.params.subscribe(async params => {
      await this.caseService.load(params.caseId)
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
      this.selectedParticipant = params.participantId
      await this.calculateAvailableEventFormDefinitions(params.participantId)
      this.loaded = true
    })
  }

  async calculateAvailableEventFormDefinitions(participantId) {
    const participant = this.caseService.case.participants.find(participant => participant.id === participantId)
    const availableEventFormDefinitionsForParticipant = this.caseEventDefinition.eventFormDefinitions
      .filter(eventFormDefinition => eventFormDefinition.forCaseRole.split(',').map(e=>e.trim()).includes(participant.caseRoleId))
      .reduce((availableEventFormDefinitions, eventFormDefinition) => {
        const eventFormDefinitionHasForm = this.caseEvent.eventForms
          .filter(eventForm => eventForm.participantId === participantId)
          .reduce((eventFormDefinitionHasForm, form) => {
            return eventFormDefinitionHasForm || form.eventFormDefinitionId === eventFormDefinition.id
          }, false)
        return eventFormDefinition.repeatable || !eventFormDefinitionHasForm
          ? [...availableEventFormDefinitions, eventFormDefinition]
          : availableEventFormDefinitions
      }, [])
    const availableEventFormDefinitions = []
    for (const eventFormDefinition of availableEventFormDefinitionsForParticipant) {
      if (await this.caseService.hasEventFormPermission(EventFormOperation.CREATE, eventFormDefinition)) {
        availableEventFormDefinitions.push(eventFormDefinition)
      }
    }
    this.availableEventFormDefinitions = availableEventFormDefinitions
  }

  onFormSelect(formId) {
    this.startEventForm(formId, this.selectedParticipant)
  }

  async startEventForm(eventFormDefinitionId:string, participantId:string) {
    const eventForm = this.caseService.createEventForm(this.caseEvent.id, eventFormDefinitionId, participantId)
    await this.caseService.save()
    // Then navigate
    this.router.navigate(['case', 'event', 'form', eventForm.caseId, eventForm.caseEventId, eventForm.id])
  }

}
