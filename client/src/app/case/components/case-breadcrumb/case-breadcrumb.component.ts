import { NotificationStatus } from './../../classes/notification.class';
import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CaseService } from '../../services/case.service'

@Component({
  selector: 'app-case-breadcrumb',
  templateUrl: './case-breadcrumb.component.html',
  styleUrls: ['./case-breadcrumb.component.css']
})
export class CaseBreadcrumbComponent implements OnInit {

  @Input() caseId:string
  @Input() caseEventId:string
  @Input() eventFormId:string
  primaryText = ''
  secondaryText = ''
  secondaryLink = ''
  hasActiveNotification = false

  constructor(
    private caseService: CaseService,
    private ref: ChangeDetectorRef
  ) {
    ref.detach()
  }

  ngOnInit() {
    const caseInstance = this.caseService.case
    const caseEvent = this.caseEventId
      ? caseInstance
        .events
        .find(caseEvent => caseEvent.id === this.caseEventId)
      : null
    const caseEventDefinition = this.caseEventId
      ? this
        .caseService
        .caseDefinition
        .eventDefinitions
        .find(caseEventDefinition => caseEventDefinition.id === caseEvent.caseEventDefinitionId)
      : null
    const eventForm = this.eventFormId
      ? caseEvent
        .eventForms
        .find(eventForm => eventForm.id === this.eventFormId)
      : null
    const eventFormDefinition = this.eventFormId
      ? caseEventDefinition
        .eventFormDefinitions
        .find(eventFormDefinition => eventFormDefinition.id === eventForm.eventFormDefinitionId)
      : null
    const participant = eventForm
      ? this.caseService.case.participants.find(participant => participant.id === eventForm.participantId)
      : null
    this.secondaryText = eventFormDefinition
      ? eventFormDefinition.name
      : caseEventDefinition 
        ? caseEventDefinition.name 
        : ''
    this.secondaryLink = eventForm 
      ? `/case/event/${caseInstance._id}/${caseEvent.id}`
      : `/case/${caseInstance._id}`
    eval(`
      this.primaryText = this.caseService.caseDefinition.templateBreadcrumbText 
        ? \`${this.caseService.caseDefinition.templateBreadcrumbText}\`
        : \`Case: ${caseInstance._id.substr(0,6)} \`
    `)
    this.evaluateHasActiveNotifications()
    this.ref.detectChanges()
  }

  evaluateHasActiveNotifications() {
    this.hasActiveNotification = this.caseService.case.notifications
      .reduce((hasActiveNotification, notification) => hasActiveNotification || notification.status === NotificationStatus.Open ? true : false, false) 
  }

}
