import { Component, OnInit, Input } from '@angular/core';
import { CaseService } from '../../services/case.service'
import { t } from 'tangy-form/util/t.js'
import { CaseDefinition } from '../../classes/case-definition.class';
import { translate } from '@polymer/polymer/lib/utils/path';

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

  constructor(
    private caseService: CaseService,
  ) { }

  ngOnInit() {
    if (this.caseEventId) {
      const caseEvent = this
        .caseService
        .case
        .events
        .find(caseEvent => caseEvent.id === this.caseEventId)
      const caseEventDefinition = this
        .caseService
        .caseDefinition
        .eventDefinitions
        .find(caseEventDefinition => caseEventDefinition.id === caseEvent.caseEventDefinitionId)
      let primaryText = ''
      let secondaryText = ''
      let secondaryLink = ''
      if (!this.eventFormId) {
        eval(`primaryText = this.caseService.caseDefinition.templateBreadcrumbText ? \`${this.caseService.caseDefinition.templateBreadcrumbText}\` : ''`)
        secondaryText = caseEventDefinition.name
        secondaryLink = `/case/${this.caseService.case._id}`
      } else {
        const eventForm = caseEvent.eventForms.find(eventForm => eventForm.id === this.eventFormId)
        const eventFormDefinition = caseEventDefinition.eventFormDefinitions.find(eventFormDefinition => eventFormDefinition.id === eventForm.eventFormDefinitionId)
        const participant = this.caseService.case.participants.find(participant => participant.id === eventForm.participantId)
        eval(`renderedPrimaryText = this.caseService.caseDefinition.templateBreadcrumbText ? \`${this.caseService.caseDefinition.templateBreadcrumbText}\` : ''`)
        secondaryText = eventFormDefinition.name
        secondaryLink = `/case/event/${this.caseService.case._id}/${caseEvent.id}`
      }
      this.primaryText = primaryText
      this.secondaryText = secondaryText
      this.secondaryLink = secondaryLink
    }

    }
  }

}
