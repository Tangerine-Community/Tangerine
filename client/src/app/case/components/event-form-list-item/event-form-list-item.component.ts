import { Router } from '@angular/router';
import { UserService } from 'src/app/shared/_services/user.service';
import { Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CaseEvent } from '../../classes/case-event.class';
import { Case } from '../../classes/case.class';
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { EventFormDefinition, EventFormOperation } from '../../classes/event-form-definition.class';
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

  @Input() case: Case;
  @Input() caseDefinition: CaseDefinition;
  @Input() caseEventDefinition: CaseEventDefinition;
  @Input() caseEvent: CaseEvent;
  @Input() eventFormDefinition: EventFormDefinition;
  @Input() eventForm: EventForm;
  @Input() caseService: CaseService;

  @Output() formDeleted = new EventEmitter();
  canOpen:Boolean

  defaultTemplateListItemIcon = `\${_this.eventForm.complete ? 'assignment_turned_in' : 'assignment'}`;
  defaultTemplateListItemPrimary = `
      <span>\${_this.eventFormDefinition.name}</span> (\${_this.eventForm.id.substr(0,6)})
  `;
  defaultTemplateListItemSecondary = `
    \${TRANSLATE('Status')}: \${!_this.eventForm.complete ? TRANSLATE('Incomplete') : TRANSLATE('Complete')}
  `;
  // renderedTemplateListItemIcon = '';
  @Input() renderedTemplateListItemIcon: string = '';
  @Input() renderedTemplateListItemPrimary: string = '';
  @Input() renderedTemplateListItemSecondary: string = '';
  canUserDeleteForms: boolean;

  response:any

  constructor(
    private formService: TangyFormService,
    private ref: ChangeDetectorRef,
    private userService:UserService,
    private router:Router,
    private appConfig:AppConfigService
  ) {
    ref.detach();
  }

  async ngOnInit() {
    const response = await this.formService.getResponse(this.eventForm.formResponseId);
    this.response = response
    // Figure out if user can open this EventForm.
    if (this.eventForm.formResponseId && !this.response) {
      // There is a form response for this Event Form, but it's not on this device.
      this.canOpen = false
    } else if (!this.eventForm.complete) {
      // The Event Form has not been completed so opening would be an UPDATE operation.
      this.canOpen = await this.caseService.hasEventFormPermission(EventFormOperation.UPDATE, this.eventFormDefinition)
    } else if (this.eventForm.complete) {
      // The Event Form has been completed so opening would be a READ operation.
      this.canOpen = await this.caseService.hasEventFormPermission(EventFormOperation.READ, this.eventFormDefinition)
    }
    this.canUserDeleteForms = (
        (this.eventFormDefinition.allowDeleteIfFormNotCompleted && !this.eventForm.complete) ||
        (this.eventFormDefinition.allowDeleteIfFormNotStarted && !this.eventForm.formResponseId)
      )  &&
      await this.caseService.hasEventFormPermission(EventFormOperation.DELETE, this.eventFormDefinition)
    
    this.renderedTemplateListItemIcon = this.caseDefinition.templateEventFormListItemIcon ? eval(`\`${this.caseDefinition.templateEventFormListItemIcon}\``) :  eval(`\`${this.defaultTemplateListItemIcon}\``);


    const templateEventFormListItemPrimary = this.caseDefinition.templateEventFormListItemPrimary.replace(/this\./g, '_this.')
    this.renderedTemplateListItemPrimary = this.caseDefinition.templateEventFormListItemPrimary ? eval(`\`${templateEventFormListItemPrimary}\``) : eval(`\`${this.defaultTemplateListItemPrimary}\``);

    const renderedTemplateListItemSecondary = this.caseDefinition.templateEventFormListItemPrimary.replace(/this\./g, '_this.')
    this.renderedTemplateListItemSecondary = this.caseDefinition.templateEventFormListItemSecondary ? eval(`\`${renderedTemplateListItemSecondary}\``) : eval(`\`${this.defaultTemplateListItemSecondary}\``);

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

  async navigateToEventForm() {
    // Bail if there is a form response for this event form but the coresponding Form Response is not available.
    if (!this.response && this.eventForm.formResponseId) {
      return
    }

    const appConfig = await this.appConfig.getAppConfig()
    if (appConfig.forceNewEventFormConfirmation) {
      if (!this.eventForm.formResponseId) {
        if (!confirm(_TRANSLATE('This Event Form has not yet started. Opening it will modify data and may lead to merge conflicts. Are you sure you want to proceed?'))) {
          return
        }
      }
    }
    this.router.navigateByUrl(`/case/event/form/${this.eventForm.caseId}/${this.eventForm.caseEventId}/${this.eventForm.id}`)
  }
}
