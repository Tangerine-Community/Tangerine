import { Component, OnInit, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/auth/_services/user.service';
import { CaseService } from '../../services/case.service'
import { EventForm } from '../../classes/event-form.class';
import { CaseEvent } from '../../classes/case-event.class';
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import { EventFormDefinition } from '../../classes/event-form-definition.class';
import { TangyFormService } from '../../../tangy-forms/tangy-form-service';
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements AfterContentInit {
  caseService:CaseService
  caseEvent: CaseEvent
  caseEventDefinition: CaseEventDefinition
  eventForm: EventForm 
  eventFormDefinition: EventFormDefinition
  tangyFormService:TangyFormService
  tangyFormEl:any
  throttledSaveLoaded:boolean;
  throttledSaveFiring:boolean;
  formResponse:any
  @ViewChild('container') container: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) { }
  async ngAfterContentInit() {
    this.route.params.subscribe(async params => {
      this.caseService = new CaseService()
      await this.caseService.load(params.caseId)
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
      const userService = new UserService()
      this.tangyFormService = new TangyFormService({ databaseName: localStorage.getItem('currentUser') });
      if (this.eventForm.formResponseId) {
        this.formResponse = await this.tangyFormService.getResponse(this.eventForm.formResponseId)
      }
      const tangyFormMarkup = await this.tangyFormService.getFormMarkup(this.eventFormDefinition.formId)
      this.container.nativeElement.innerHTML = tangyFormMarkup
      this.tangyFormEl = this.container.nativeElement.querySelector('tangy-form') 
      if (this.formResponse) {
        this.tangyFormEl.response = this.formResponse
      } else {
        this.tangyFormEl.newResponse()
        this.eventForm.formResponseId = this.tangyFormEl.store.getState()._id
        await this.caseService.save()
      }
      this.tangyFormEl.addEventListener('TANGY_FORM_UPDATE', _ => {
        let response = _.target.store.getState()
        this.throttledSaveResponse(response)
      })
    })
  }

  // Prevent parallel saves which leads to race conditions. Only save the first and then last state of the store.
  // Everything else in between we can ignore.
  async throttledSaveResponse(response) {
    // If already loaded, return.
    if (this.throttledSaveLoaded) return
    // Throttle this fire by waiting until last fire is done.
    if (this.throttledSaveFiring) {
      this.throttledSaveLoaded = true
      while (this.throttledSaveFiring) await sleep(200)
      this.throttledSaveLoaded = false
    }
    // Fire it.
    this.throttledSaveFiring = true
    await this.saveResponse(response)
    this.throttledSaveFiring = false
  }

  async saveResponse(state) {
    let stateDoc = {}
    try {
      stateDoc = await this.tangyFormService.getResponse(state._id)
    } catch (e) {
      let r = await this.tangyFormService.saveResponse(state)
      stateDoc = await this.tangyFormService.getResponse(state._id)
    }
    let newStateDoc = Object.assign({}, state, { _rev: stateDoc['_rev'] })
    await this.tangyFormService.saveResponse(newStateDoc)
  }
}
