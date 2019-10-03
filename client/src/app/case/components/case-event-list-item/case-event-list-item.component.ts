import { Component, OnInit, Input } from '@angular/core';
import { CaseEvent } from '../../classes/case-event.class';
import { Case } from '../../classes/case.class';
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { DatePipe } from '@angular/common';
import * as moment from 'moment'

@Component({
  selector: 'app-case-event-list-item',
  templateUrl: './case-event-list-item.component.html',
  styleUrls: ['./case-event-list-item.component.css']
})
export class CaseEventListItemComponent implements OnInit {

  @Input() caseEventDefinition:CaseEventDefinition
  @Input() caseEvent:CaseEvent
  @Input() case:Case
  defaultTemplateListItemIcon = `\${caseEvent.complete ? 'event_available' : 'event_note'}`
  defaultTemplateListItemPrimary = `
      <span>\${caseEventDefinition.name}</span> (\${caseEvent.id.substr(0,6)})
  `
  defaultTemplateListItemSecondary = `
    \${TRANSLATE('Scheduled')}: \${formatDate(caseEvent.dateStart,'dddd, MMMM Do YYYY, h:mm:ss a')},
    \${TRANSLATE('Status')}: \${!caseEvent.complete ? TRANSLATE('Incomplete') : TRANSLATE('Complete')}
  `
  renderedTemplateListItemIcon = ''
  renderedTemplateListItemPrimary = ''
  renderedTemplateListItemSecondary = ''

  constructor() { }

  ngOnInit() {
    const getVariable = (variableName) => {
      const variablesByName = this.case.items.reduce((variablesByName,item) => {
        for (let input of item.inputs) {
          variablesByName[input.name] = input.value
        }
        return variablesByName
      }, {})
      return variablesByName[variableName]
    }
    const caseEventDefinition = this.caseEventDefinition
    const caseEvent = this.caseEvent
    const caseInstance = this.case
    const formatDate = (unixTimeInMilliseconds, format) => moment(new Date(unixTimeInMilliseconds)).format(format)
    const TRANSLATE = _TRANSLATE
    eval(`this.renderedTemplateListItemIcon = this.caseEventDefinition.templateListItemIcon ? \`${this.caseEventDefinition.templateListItemIcon}\` : \`${this.defaultTemplateListItemIcon}\``)
    eval(`this.renderedTemplateListItemPrimary = this.caseEventDefinition.templateListItemPrimary ? \`${this.caseEventDefinition.templateListItemPrimary}\` : \`${this.defaultTemplateListItemPrimary}\``)
    eval(`this.renderedTemplateListItemSecondary = this.caseEventDefinition.templateListItemSecondary ? \`${this.caseEventDefinition.templateListItemSecondary}\` : \`${this.defaultTemplateListItemSecondary}\``)
  }

}
