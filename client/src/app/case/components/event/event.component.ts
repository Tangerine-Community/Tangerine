import { EventFormDefinition } from './../../classes/event-form-definition.class';
import { Component, OnInit, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../shared/_services/user.service';
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
    private userService: UserService,
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
      this.participantInfos = this.caseService.case.participants.map(participant => {
        const id = participant.id
        const data = participant.data
        const role = this.caseService.caseDefinition.caseRoles.find(caseRole => caseRole.id === participant.caseRoleId)
        let renderedListItem:string
        eval(`renderedListItem = \`${role.templateListItem}\``) 
        return <ParticipantInfo>{
          id,
          renderedListItem,
          newFormLink: `/case/event/form-add/${this.caseService.case._id}/${this.caseEvent.id}/${participant.id}`,
          availableEventFormDefinitionsForParticipant: this.calculateAvailableEventFormDefinitionsForParticipant(participant.id),
          eventFormInfos: this.caseEvent.eventForms.reduce((eventFormInfos, eventForm) => {
            return eventForm.participantId === participant.id
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
      })
      .filter(participantInfo => participantInfo.eventFormInfos.length !== 0)
      // ^ Remove this filter??
      //this.calculateAvailableEventFormDefinitions()
      this.loaded = true
      this.ref.detectChanges()
    })
  }

  calculateAvailableEventFormDefinitionsForParticipant(participantId) {
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

}