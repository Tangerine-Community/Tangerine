import { Router } from '@angular/router';
import { Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CaseEvent } from '../../classes/case-event.class';
import { Case } from '../../classes/case.class';
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { EventFormDefinition } from '../../classes/event-form-definition.class';
import { EventForm } from '../../classes/event-form.class';
import { CaseDefinition } from '../../classes/case-definition.class';
import { TangyFormService } from 'src/app/tangy-forms/tangy-form.service';
import { CaseService } from '../../services/case.service';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { t } from 'tangy-form/util/t.js'



@Component({
  selector: 'app-event-form-list-item',
  templateUrl: './event-form-list-item.component.html',
  styleUrls: ['./event-form-list-item.component.css']
})
export class EventFormListItemComponent implements OnInit {

  @Input() case: Case;
  @Input() caseDefinition: CaseDefinition;
  @Input() caseEventDefinition: CaseEventDefinition;
  @Input() caseEvent: CaseEvent;
  @Input() eventFormDefinition: EventFormDefinition;
  @Input() eventForm: EventForm;
  @Output() formDeleted = new EventEmitter();

  defaultTemplateListItemIcon = `\${eventForm.complete ? 'assignment_turned_in' : 'assignment'}`;
  defaultTemplateListItemPrimary = `
      <span>\${eventFormDefinition.name}</span> (\${eventForm.id.substr(0,6)})
  `;
  defaultTemplateListItemSecondary = `
    \${TRANSLATE('Status')}: \${!eventForm.complete ? TRANSLATE('Incomplete') : TRANSLATE('Complete')}
  `;
  renderedTemplateListItemIcon = '';
  renderedTemplateListItemPrimary = '';
  renderedTemplateListItemSecondary = '';
  canUserDeleteForms: boolean;
  response:any

  constructor(
    private formService: TangyFormService,
    private ref: ChangeDetectorRef,
    private router:Router,
    private caseService: CaseService
  ) {
    ref.detach();
  }

  async ngOnInit() {
    this.canUserDeleteForms = ((this.eventFormDefinition.allowDeleteIfFormNotCompleted && !this.eventForm.complete)
    || (this.eventFormDefinition.allowDeleteIfFormNotStarted && !this.eventForm.formResponseId));
    const response = await this.formService.getResponse(this.eventForm.formResponseId);
    this.response = response
    const getValue = (variableName) => {
      if (response) {
        const variablesByName = response.items.reduce((variablesByName, item) => {
          for (const input of item.inputs) {
            variablesByName[input.name] = input.value;
          }
          return variablesByName;
        }, {});
        return !Array.isArray(variablesByName[variableName]) ? variablesByName[variableName] : variablesByName[variableName].reduce((optionThatIsOn, option) => optionThatIsOn = option.value === 'on' ? option.name : optionThatIsOn, '');
      }
    };
    const getCaseVariable = (variableName) => {
      const variablesByName = this.case.items.reduce((variablesByName, item) => {
        for (const input of item.inputs) {
          variablesByName[input.name] = input.value;
        }
        return variablesByName;
      }, {});
      return variablesByName[variableName];
    };
    const caseInstance = this.case;
    const caseDefinition = this.caseDefinition;
    const caseEventDefinition = this.caseEventDefinition;
    const caseEvent = this.caseEvent;
    const eventForm = this.eventForm;
    const eventFormDefinition = this.eventFormDefinition;
    const formatDate = (unixTimeInMilliseconds, format) => moment(new Date(unixTimeInMilliseconds)).format(format);
    const TRANSLATE = _TRANSLATE;
    eval(`this.renderedTemplateListItemIcon = this.caseDefinition.templateEventFormListItemIcon ? \`${this.caseDefinition.templateEventFormListItemIcon}\` : \`${this.defaultTemplateListItemIcon}\``);
    eval(`this.renderedTemplateListItemPrimary = this.caseDefinition.templateEventFormListItemPrimary ? \`${this.caseDefinition.templateEventFormListItemPrimary}\` : \`${this.defaultTemplateListItemPrimary}\``);
    eval(`this.renderedTemplateListItemSecondary = this.caseDefinition.templateEventFormListItemSecondary ? \`${this.caseDefinition.templateEventFormListItemSecondary}\` : \`${this.defaultTemplateListItemSecondary}\``);
    this.ref.detectChanges();
  }
  async deleteItem() {
    const confirmDelete = confirm(
      _TRANSLATE('Are you sure you want to delete this form instance? You will not be able to undo the operation')
      );
    if (confirmDelete) {
      this.caseService.deleteEventForm(this.eventForm.caseEventId, this.eventForm.id);
      await this.caseService.save();
      this.formDeleted.emit('formDeleted');
      this.ref.detectChanges();
    }
  }

  navigateToEventForm() {
    if (!this.eventForm.formResponseId) {
      if (!confirm(t('This Event Form has not yet started. Opening it will modify data and may lead to merge conflicts. Are you sure you want to proceed?'))) {
        return
      }
    }
    if (this.eventForm.formResponseId && !this.response.form.complete) {
      if (!confirm(t('This Event Form is incomplete. Opening it will modify data and may lead to merge conflicts. Are you sure you want to proceed?'))) {
        return
      }
    }
    this.router.navigateByUrl(`/case/event/form/${this.eventForm.caseId}/${this.eventForm.caseEventId}/${this.eventForm.id}`)
  }
}
