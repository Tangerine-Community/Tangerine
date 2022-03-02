import { NotificationStatus } from './../../classes/notification.class';
import { EventFormDefinition } from './../../classes/event-form-definition.class';

import { Component, OnInit, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseService } from '../../services/case.service'
import { CaseEvent } from '../../classes/case-event.class'
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import { EventForm } from '../../classes/event-form.class';
import { ProcessMonitorService } from 'src/app/shared/_services/process-monitor.service';
import { _TRANSLATE } from 'src/app/shared/translation-marker';

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
  styleUrls: ['./event.component.css'],
  providers: [ CaseService ]
})
export class EventComponent implements OnInit, AfterContentInit {

  caseEvent:CaseEvent
  caseEventDefinition: CaseEventDefinition
  participantInfos:Array<ParticipantInfo>
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
    private processMonitorService:ProcessMonitorService,
    private ref: ChangeDetectorRef
  ) {
    ref.detach()
    this.window = window
  }

  ngOnInit() {
  }

  async ngAfterContentInit() {
    const process = this.processMonitorService.start('eventComponentInit', _TRANSLATE('Opening event...'))
    this.route.params.subscribe(async params => {
      await this.caseService.load(params.caseId)
      this.caseService.setContext(params.eventId)
      this.caseService['instanceFrom'] = 'EventComponent'
      this.window.caseService = this.caseService
      this.window.T.case = this.caseService
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
      // ^ Remove this filter??
      //this.calculateAvailableEventFormDefinitions()
      if (this.caseService.case.notifications) {
        this.hasNotificationEnforcingAttention = this
          .caseService
          .case
          .notifications
          .reduce((hasNotificationEnforcingAttention, notification) => {
            return hasNotificationEnforcingAttention || (notification.enforceAttention && notification.status === NotificationStatus.Open)
             ? true
             : false
          }, false)
        this._canExitToRoute = this
          .caseService
          .case
          .notifications
          .reduce((canExitToRoute, notification) => {
            return (notification.enforceAttention && notification.status === NotificationStatus.Open)
             ? [...canExitToRoute, notification.link]
             : canExitToRoute
          }, [])
      }
      this.loaded = true
      this.ref.detectChanges()
      this.processMonitorService.stop(process.id)
    })
  }

  exitRoutes() {
    return this._canExitToRoute
  }

}
