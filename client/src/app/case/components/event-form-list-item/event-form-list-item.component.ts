import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CaseEvent } from '../../classes/case-event.class';
import { Case } from '../../classes/case.class';
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { DatePipe } from '@angular/common';
import * as moment from 'moment'
import { EventFormDefinition } from '../../classes/event-form-definition.class';
import { EventForm } from '../../classes/event-form.class';
import { CaseDefinition } from '../../classes/case-definition.class';
import { TangyFormService } from 'src/app/tangy-forms/tangy-form.service';
import { CaseService } from '../../services/case.service';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';



@Component({
  selector: 'app-event-form-list-item',
  templateUrl: './event-form-list-item.component.html',
  styleUrls: ['./event-form-list-item.component.css']
})
export class EventFormListItemComponent implements OnInit {

  @Input() case:Case
  @Input() caseDefinition:CaseDefinition
  @Input() caseEventDefinition:CaseEventDefinition
  @Input() caseEvent:CaseEvent
  @Input() eventFormDefinition:EventFormDefinition
  @Input() eventForm:EventForm

  defaultTemplateListItemIcon = `\${eventForm.complete ? 'assignment_turned_in' : 'assignment'}`
  defaultTemplateListItemPrimary = `
      <span>\${eventFormDefinition.name}</span> (\${eventForm.id.substr(0,6)})
  `
  defaultTemplateListItemSecondary = `
    \${TRANSLATE('Status')}: \${!eventForm.complete ? TRANSLATE('Incomplete') : TRANSLATE('Complete')}
  `
  renderedTemplateListItemIcon = ''
  renderedTemplateListItemPrimary = ''
  renderedTemplateListItemSecondary = ''

  constructor(
    private formService:TangyFormService,
    private ref: ChangeDetectorRef
  ) {
    ref.detach()
  }

  async ngOnInit() {
    const response = await this.formService.getResponse(this.eventForm.formResponseId)
    const getValue = (variableName) => {
      const variablesByName = response.items.reduce((variablesByName,item) => {
        for (let input of item.inputs) {
          variablesByName[input.name] = input.value
        }
        return variablesByName
      }, {})
      return !Array.isArray(variablesByName[variableName]) ? variablesByName[variableName] : variablesByName[variableName].reduce((optionThatIsOn, option) => optionThatIsOn = option.value === 'on' ? option.name : optionThatIsOn, '')
    }
    const getCaseVariable = (variableName) => {
      const variablesByName = this.case.items.reduce((variablesByName,item) => {
        for (let input of item.inputs) {
          variablesByName[input.name] = input.value
        }
        return variablesByName
      }, {})
      return variablesByName[variableName]
    }
    const caseInstance = this.case
    const caseDefinition = this.caseDefinition
    const caseEventDefinition = this.caseEventDefinition
    const caseEvent = this.caseEvent
    const eventForm = this.eventForm
    const eventFormDefinition = this.eventFormDefinition
    const formatDate = (unixTimeInMilliseconds, format) => moment(new Date(unixTimeInMilliseconds)).format(format)
    const TRANSLATE = _TRANSLATE
    eval(`this.renderedTemplateListItemIcon = this.caseDefinition.templateEventFormListItemIcon ? \`${this.caseDefinition.templateEventFormListItemIcon}\` : \`${this.defaultTemplateListItemIcon}\``)
    eval(`this.renderedTemplateListItemPrimary = this.caseDefinition.templateEventFormListItemPrimary ? \`${this.caseDefinition.templateEventFormListItemPrimary}\` : \`${this.defaultTemplateListItemPrimary}\``)
    eval(`this.renderedTemplateListItemSecondary = this.caseDefinition.templateEventFormListItemSecondary ? \`${this.caseDefinition.templateEventFormListItemSecondary}\` : \`${this.defaultTemplateListItemSecondary}\``)
    this.ref.detectChanges()
  }

}
