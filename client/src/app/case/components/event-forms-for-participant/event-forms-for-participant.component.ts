import { NotificationStatus } from './../../classes/notification.class';
import { EventFormDefinition } from './../../classes/event-form-definition.class';

import { Component, OnInit, AfterContentInit, ChangeDetectorRef, Input } from '@angular/core';
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
  newFormLink:string
  eventFormsParticipantCanCreate: Array<string>
  caseEventHasEventFormsForParticipantsRole:boolean
  eventFormInfos: Array<EventFormInfo>
}

@Component({
  selector: 'app-event-forms-for-participant',
  templateUrl: './event-forms-for-participant.component.html',
  styleUrls: ['./event-forms-for-participant.component.css']
})
export class EventFormsForParticipantComponent implements OnInit {

  @Input('participantId') participantId:string
  @Input('caseId') caseId:string
  @Input('eventId') eventId:string

  caseEvent:CaseEvent
  caseEventDefinition: CaseEventDefinition
  participantInfos:Array<ParticipantInfo>
  participantInfo:ParticipantInfo
  noRoleEventFormInfos: Array<EventFormInfo>
  loaded = false
  availableEventFormDefinitions:Array<EventFormDefinition> = []
  selectedNewEventFormDefinition = ''
  hasNotificationEnforcingAttention = false
  _canExitToRoute = []
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
    this.render()
  }

  onFormDelete() {
    console.log('form delete detected')
    this.render()
  }

  async render() {
    await this.caseService.load(this.caseId)
    this.window.caseService = this.caseService
    this.caseEvent = this
      .caseService
      .case
      .events
      .find(caseEvent => caseEvent.id === this.eventId)
    this.caseEventDefinition = this
      .caseService
      .caseDefinition
      .eventDefinitions
      .find(caseDef => caseDef.id === this.caseEvent.caseEventDefinitionId)
    this.getParticipantInfo()
    this.loaded = true
    this.ref.detectChanges()
  }

  exitRoutes() {
    return this._canExitToRoute
  }

  eventFormsParticipantCanCreate(participantId) {
    const participant = this.caseService.case.participants.find(participant => participant.id === participantId)
    return this.caseEventDefinition.eventFormDefinitions
      .filter(eventFormDefinition => eventFormDefinition.forCaseRole === participant.caseRoleId)
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
  }

  updateFormList(event) {
    if (event === 'formDeleted') {
      this.getParticipantInfo()
      this.ref.detectChanges()
    }
  }

  getParticipantInfo() {
    const participant = this.caseService.case.participants.find(participant => participant.id === this.participantId)
    const id = participant.id
    const data = participant.data
    const role = this.caseService.caseDefinition.caseRoles.find(caseRole => caseRole.id === participant.caseRoleId)
    let renderedListItem:string
    eval(`renderedListItem = \`${role.templateListItem}\``)
    const participantInfo = <ParticipantInfo>{
      id,
      renderedListItem,
      newFormLink: `/case/event/form-add/${this.caseService.case._id}/${this.caseEvent.id}/${participant.id}`,
      caseEventHasEventFormsForParticipantsRole: this.caseEventDefinition.eventFormDefinitions.some(eventDef => eventDef.forCaseRole === participant.caseRoleId),
      eventFormsParticipantCanCreate: participant.inactive
        ? []
        : this.eventFormsParticipantCanCreate(participant.id),
      eventFormInfos: this.caseEvent.eventForms.reduce((eventFormInfos, eventForm) => {
        return eventForm.participantId === participant.id && (!participant.inactive || eventForm.formResponseId)
          ? [...eventFormInfos, <EventFormInfo>{
            eventForm,
            eventFormDefinition: this
              .caseEventDefinition
              .eventFormDefinitions
              .find(eventFormDefinition => eventFormDefinition.id === eventForm.eventFormDefinitionId)
          }]
          : eventFormInfos
      }, [])
    }
    this.participantInfo = participantInfo
  }

}
