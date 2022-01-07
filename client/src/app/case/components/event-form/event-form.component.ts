import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model.js';
import { TangyFormsPlayerComponent } from './../../../tangy-forms/tangy-forms-player/tangy-forms-player.component';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseService } from '../../services/case.service'
import { EventForm } from '../../classes/event-form.class';
import { CaseEvent } from '../../classes/case-event.class';
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import { EventFormDefinition } from '../../classes/event-form-definition.class';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { Process, ProcessMonitorService } from 'src/app/shared/_services/process-monitor.service';
import { _TRANSLATE } from 'src/app/shared/translation-marker';
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css'],
  providers: [ CaseService ]
})
export class EventFormComponent implements OnInit, OnDestroy {

  caseEvent: CaseEvent
  caseEventDefinition: CaseEventDefinition
  eventFormDefinition: EventFormDefinition
  eventForm: EventForm
  caseId:string
  formInfo: FormInfo
  formId:string
  templateId:string
  formResponseId:string
  allowCreationOfIssues:boolean
  publicCaseService:CaseService

  hasEventFormRedirect = false
  eventFormRedirectUrl = ''
  eventFormRedirectBackButtonText = ''

  submitProcess:Process
  isWrappingUp = false
  isSaving = false
  loaded = false
  isFormComplete = false

  window:any

  @ViewChild('container', {static: true}) container: ElementRef;
  @ViewChild('menu', {static: true}) menu: ElementRef;
  @ViewChild('formPlayer', {static: true}) formPlayer: TangyFormsPlayerComponent

  constructor(
    private route: ActivatedRoute,
    private hostElementRef: ElementRef,
    private router: Router,
    private caseService: CaseService,
    private appConfigService:AppConfigService,
    private processMonitorService:ProcessMonitorService,
    private ref: ChangeDetectorRef
  ) {
    ref.detach()
    this.window = window
    this.publicCaseService = caseService
  }

  async ngOnInit() {
    const process = this.processMonitorService.start('eventFormOpen', _TRANSLATE('Opening Event Form...'))
    setTimeout(() => this.hostElementRef.nativeElement.classList.add('hide-spinner'), 1500)
    this.hasEventFormRedirect = window['eventFormRedirect'] ? true : false
    this.eventFormRedirectUrl = window['eventFormRedirect']
    this.eventFormRedirectBackButtonText = window['eventFormRedirectBackButtonText']
    this.route.params.subscribe(async params => {
      this.caseId = params.caseId
      await this.caseService.load(this.caseId)
      this.caseService.setContext(params.eventId, params.eventFormId)
      this.window.caseService = this.caseService
      this.window.T.case = this.caseService
      this.caseService['instanceFrom'] = 'EventFormComponent'
      const localT = {
        ...window['T'],
        case: this.caseService
      }
      this.formPlayer.inject('T', localT)
      this.formPlayer.inject('caseService', this.caseService)
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
      this.onEventOpen()
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
      this.caseService.onChangeLocation$.subscribe(location => {
        this.formPlayer.location = this.caseService.case.location
      })
      const appConfig = await this.appConfigService.getAppConfig()
      this.allowCreationOfIssues = appConfig.allowCreationOfIssues
      this.loaded = true
      this.isFormComplete = this.eventForm.complete
      this.ref.detectChanges()
      this.formPlayer.$beforeSubmit.subscribe(async () => {
        this.submitProcess = this.processMonitorService.start('eventFormSubmitProcess', _TRANSLATE("Submitting..."))
      })
      this.formPlayer.$afterSubmit.subscribe(async () => {
        this.isWrappingUp = true
        setTimeout(async () => {
          while (this.isSaving) {
            sleep(1000)
          }
          // If this was a one page form, the form response ID may not have been linked yet.
          if (!this.eventForm.formResponseId) {
            // Note that this.eventForm is a memory reference that may be now disconnected from caseService's loaded case due to loading a different
            // case and then the current case back again. This is why we need to be careful to set the relationship directly into the case in memory.
            this
              .caseService
              .case
              .events
              .find(caseEvent => caseEvent.id === this.caseEvent.id)
              .eventForms
              .find(eventForm => eventForm.id === this.eventForm.id)
              .formResponseId = this.formPlayer.formResponseId
          }
          this.caseService.markEventFormComplete(this.caseEvent.id, this.eventForm.id)
          await this.caseService.save()
          const tangyFormResponseModel = new TangyFormResponseModel(this.formPlayer.response)
          const inputsWithDiscrepancy = tangyFormResponseModel.inputs
            .reduce((inputsWithDiscrepancy, input) => input.hasDiscrepancy ? [...inputsWithDiscrepancy, input] : inputsWithDiscrepancy, [])
          if (inputsWithDiscrepancy.length > 0) {
            const formInfo = this.formPlayer.formInfo
            await this.caseService.createIssue(`Discrepancy on ${formInfo.title}`, '', this.caseService.case._id, this.caseEvent.id, this.eventForm.id, window['userProfile']._id, window['username'], null)
          }
          await this.caseService.createIssuesInQueue()
          // @TODO This redirect may not be need now that we are not displaying form until `this.readyForDataEntry = true`.
          // @TODO Why do we have to redirect back to the case event page to avoid a database conflict error when redirecting
          // to another event form???
          window.location.hash = `#/${['case', 'event', this.caseService.case._id, this.caseEvent.id].join('/')}`
          if (window['eventFormRedirect']) {
            this.eventFormRedirect()
          }
          this.processMonitorService.stop(this.submitProcess.id)
        }, 500)
      })
      this.formPlayer.$rendered.subscribe(async () => {
        this.processMonitorService.stop(process.id)
      })
      this.formPlayer.render()
    })
  }
  
  onEventOpen(){
    eval(this.eventFormDefinition.onEventOpen)
  }

  ngOnDestroy(){
    eval(this.eventFormDefinition.onEventClose)
  }
  eventFormRedirect() {
    window.location.hash = window['eventFormRedirect']
    // Reset the event form redirect so it doesn't become permanent.
    window['eventFormRedirect'] = ''
  }

}
