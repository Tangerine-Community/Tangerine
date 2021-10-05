import { Router } from '@angular/router';
import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CaseService } from '../../services/case.service'
import {_TRANSLATE} from "../../../shared/translation-marker";
import {Case} from "../../classes/case.class";
import { AuthenticationService } from 'src/app/core/auth/_services/authentication.service';

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
  primaryText = ''
  secondaryText = ''
  secondaryLink = ''
  groupId = ''

  constructor(
    private caseService: CaseService,
    private router: Router,
    private authenticationService: AuthenticationService,
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

  async delete() {
    const confirmDelete = confirm(
      _TRANSLATE('Are you sure you want to delete this case? You will not be able to undo the operation')
    );
    if (confirmDelete) {
      console.log("Deleting")
      await this.caseService.delete()
      this.goBackToCases()
    }
  }

}
