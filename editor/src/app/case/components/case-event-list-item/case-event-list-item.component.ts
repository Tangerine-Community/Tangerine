import { Component, Input, Output,  OnInit, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CaseEvent } from '../../classes/case-event.class';
import { Case } from '../../classes/case.class';
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import { _TRANSLATE } from 'src/app/shared/translation-marker';
import * as moment from 'moment'
import { CaseDefinition } from '../../classes/case-definition.class';
import { CaseService } from '../../services/case.service';

@Component({
  selector: 'app-case-event-list-item',
  templateUrl: './case-event-list-item.component.html',
  styleUrls: ['./case-event-list-item.component.css']
})
export class CaseEventListItemComponent implements OnInit {

  @Input() caseDefinition:CaseDefinition
  @Input() caseEventDefinition:CaseEventDefinition
  @Input() caseEvent:CaseEvent
  @Input() case:Case
  @Input() showArchived:boolean;
  @Output() caseEventArchiveEvent = new EventEmitter();
  @Output() caseEventUnarchiveEvent = new EventEmitter();

  groupId:string;
  caseEventArchived: boolean = false;

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

  constructor(
    private ref: ChangeDetectorRef,
    private caseService: CaseService,
    private router: Router,
  ) {
    ref.detach()
  }

  ngOnInit() {
    this.groupId = window.location.pathname.split('/')[2]
    
    this.loadCaseEventInfo()
  }

  loadCaseEventInfo() {
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
    eval(`this.renderedTemplateListItemIcon = this.caseDefinition.templateCaseEventListItemIcon ? \`${this.caseDefinition.templateCaseEventListItemIcon}\` : \`${this.defaultTemplateListItemIcon}\``)
    eval(`this.renderedTemplateListItemPrimary = this.caseDefinition.templateCaseEventListItemPrimary ? \`${this.caseDefinition.templateCaseEventListItemPrimary}\` : \`${this.defaultTemplateListItemPrimary}\``)
    eval(`this.renderedTemplateListItemSecondary = this.caseDefinition.templateCaseEventListItemSecondary ? \`${this.caseDefinition.templateCaseEventListItemSecondary}\` : \`${this.defaultTemplateListItemSecondary}\``)

    this.caseEventArchived = this.caseEvent.archived

    this.ref.detectChanges()
  }

  onCaseEventClick() {
    this.router.navigate(['case', 'event', this.caseService.case._id, this.caseEvent.id])
  }

  onArchiveEventClick() {
      this.caseEventArchiveEvent.emit(this.caseEvent.id)
  }

  onUnarchiveCaseClick() {
    this.caseEventUnarchiveEvent.emit(this.caseEvent.id)
  }

}
