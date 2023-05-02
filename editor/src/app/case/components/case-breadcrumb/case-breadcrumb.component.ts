import { Router } from '@angular/router';
import { Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CaseService } from '../../services/case.service'
import {_TRANSLATE} from "../../../shared/translation-marker";
import {Case} from "../../classes/case.class";

@Component({
  selector: 'app-case-breadcrumb',
  templateUrl: './case-breadcrumb.component.html',
  styleUrls: ['./case-breadcrumb.component.css']
})
export class CaseBreadcrumbComponent implements OnInit {

  @Input() caseId:string
  @Input() caseEventId:string
  @Input() eventFormId:string
  @Input() caseInstance:Case
  @Output() caseActionEvent = new EventEmitter();
  primaryText = ''
  secondaryText = ''
  secondaryLink = ''
  groupId:string

  constructor(
    private caseService: CaseService,
    private router: Router,
    private ref: ChangeDetectorRef
  ) {
    ref.detach()
  }

  ngOnInit() {
    this.caseInstance = this.caseService.case
    this.groupId = window.location.pathname.split('/')[2]
    const caseEvent = this.caseEventId
      ? this.caseInstance
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
      ? `/case/event/${this.caseInstance._id}/${caseEvent.id}`
      : `/case/${this.caseInstance._id}`
    eval(`
      this.primaryText = this.caseService.caseDefinition.templateBreadcrumbText 
        ? \`${this.caseService.caseDefinition.templateBreadcrumbText}\`
        : \`Case: ${this.caseInstance._id.substr(0,6)} \`
    `)
    this.ref.detectChanges()
  }

  goBackToCases() {
    this.router.navigate(['groups', window.location.pathname.split('/')[2], 'data', 'cases']) 
  }

  deleteCase() {
    this.caseActionEvent.emit('delete');
  }

  archiveCase() {
    this.caseActionEvent.emit('archive');
  }

  unarchiveCase() {
    this.caseActionEvent.emit('unarchive');
  }

}
