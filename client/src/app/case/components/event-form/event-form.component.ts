import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model.js';
import { TangyFormsPlayerComponent } from './../../../tangy-forms/tangy-forms-player/tangy-forms-player.component';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { Component, OnInit, ViewChild, ElementRef, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseService } from '../../services/case.service'
import { EventForm } from '../../classes/event-form.class';
import { CaseEvent } from '../../classes/case-event.class';
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import { EventFormDefinition } from '../../classes/event-form-definition.class';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {

  caseEvent: CaseEvent
  caseEventDefinition: CaseEventDefinition
  eventFormDefinition: EventFormDefinition
  eventForm: EventForm
  formInfo: FormInfo
  formId:string
  templateId:string
  formResponseId:string

  hasEventFormRedirect = false
  eventFormRedirectUrl = ''
  eventFormRedirectBackButtonText = ''

  loaded = false

  window:any

  @ViewChild('container', {static: true}) container: ElementRef;
  @ViewChild('menu', {static: true}) menu: ElementRef;
  @ViewChild('formPlayer', {static: true}) formPlayer: TangyFormsPlayerComponent

  constructor(
    private route: ActivatedRoute,
    private hostElementRef: ElementRef,
    private router: Router,
    private caseService: CaseService,
    private ref: ChangeDetectorRef
  ) {
    ref.detach()
    this.window = window
  }

  async ngOnInit() {
    setTimeout(() => this.hostElementRef.nativeElement.classList.add('hide-spinner'), 1500)
    this.hasEventFormRedirect = window['eventFormRedirect'] ? true : false
    this.eventFormRedirectUrl = window['eventFormRedirect']
    this.eventFormRedirectBackButtonText = window['eventFormRedirectBackButtonText']
    this.route.params.subscribe(async params => {
      await this.caseService.load(params.caseId)
      this.caseService.setContext(params.eventId, params.eventFormId)
      this.window.caseService = this.caseService
      this.caseEvent = this
        .caseService
        .case
        .events
        .find(caseEvent => caseEvent.id === params.eventId)
      this.caseEventDefinition = this
        .caseService
        .caseDefinition
        .eventDefinitions
        .find(caseDef => caseDef.id === this.caseEvent.caseEventDefinitionId)
      this.eventForm = this.caseEvent.eventForms.find(eventForm => eventForm.id === params.eventFormId)
      this.eventFormDefinition = this
        .caseEventDefinition
        .eventFormDefinitions
        .find(eventFormDefinition => eventFormDefinition.id === this.eventForm.eventFormDefinitionId)
      this.formId = this.eventFormDefinition.formId

      this.formResponseId = this.eventForm.formResponseId || ''
      this.formPlayer.formId = this.formId
      this.formPlayer.formResponseId = this.formResponseId
      this.formPlayer.templateId = this.templateId
      this.formPlayer.location = this.caseService.case.location
      this.formPlayer.metadata = {
        caseId: this.caseEvent.caseId,
        eventId: this.caseEvent.id,
        eventFormId: this.eventForm.id,
        participantId: this.eventForm.participantId
      }
      this.formPlayer.render()

      this.caseService.onChangeLocation$.subscribe(location => {
        this.formPlayer.location = this.caseService.case.location
      })

      // After render of the player, it will have created a new form response if one was not assigned.
      // Make sure to save that new form response ID into the EventForm.
      this.formPlayer.$rendered.subscribe(async () => {
        if (!this.formResponseId) {
          this.eventForm.formResponseId = this.formPlayer.formResponseId
          await this.caseService.save()
        }
      })
      this.formPlayer.$submit.subscribe(async () => {
        setTimeout(async () => {
          this.caseService.markEventFormComplete(this.caseEvent.id, this.eventForm.id)
          await this.caseService.save()
          const tangyFormResponseModel = new TangyFormResponseModel(this.formPlayer.response)
          const inputsWithDiscrepancy = tangyFormResponseModel.inputs
            .reduce((inputsWithDiscrepancy, input) => input.hasDiscrepancy ? [...inputsWithDiscrepancy, input] : inputsWithDiscrepancy, [])
          if (inputsWithDiscrepancy.length > 0) {
            const formInfo = this.formPlayer.formInfo
            await this.caseService.createIssue(`Discrepancy on ${formInfo.title}`, '', this.caseService.case._id, this.caseEvent.id, this.eventForm.id, window['userProfile']._id, window['username'], null)
          }
          // @TODO Why do we have to redirect back to the case event page to avoid a database conflict error when redirecting
          // to another event form???
          window.location.hash = `#/${['case', 'event', this.caseService.case._id, this.caseEvent.id].join('/')}`
          if (window['eventFormRedirect']) {
            this.eventFormRedirect()
          }
        }, 500)
      })
      this.loaded = true
      this.ref.detectChanges()
    })
  }
  
  eventFormRedirect() {
    window.location.hash = window['eventFormRedirect']
    // Reset the event form redirect so it doesn't become permanent.
    window['eventFormRedirect'] = ''
  }

}
