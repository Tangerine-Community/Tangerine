import { Component, OnInit, Input } from '@angular/core';
import { CaseService } from '../../services/case.service'
import { t } from 'tangy-form/util/t.js'

@Component({
  selector: 'app-case-breadcrumb',
  templateUrl: './case-breadcrumb.component.html',
  styleUrls: ['./case-breadcrumb.component.css']
})
export class CaseBreadcrumbComponent implements OnInit {

  @Input() caseId:string
  @Input() caseEventId:string
  @Input() eventFormId:string
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
      if (!this.eventFormId) {
        this.secondaryText = caseEventDefinition.name
        this.secondaryLink = `/case/${this.caseService.case._id}`
      } else {
        const eventForm = caseEvent.eventForms.find(eventForm => eventForm.id === this.eventFormId)
        const eventFormDefinition = caseEventDefinition.eventFormDefinitions.find(eventFormDefinition => eventFormDefinition.id === eventForm.eventFormDefinitionId)
        this.secondaryText = eventFormDefinition.name
        this.secondaryLink = `/case/event/${this.caseService.case._id}/${caseEvent.id}`
      }

    }
  }

}
