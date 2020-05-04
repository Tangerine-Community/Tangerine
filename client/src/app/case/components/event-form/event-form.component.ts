import { Component, OnInit, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseService } from '../../services/case.service'
import { EventForm } from '../../classes/event-form.class';
import { CaseEvent } from '../../classes/case-event.class';
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import { EventFormDefinition } from '../../classes/event-form-definition.class';
import { TangyFormService } from '../../../tangy-forms/tangy-form.service';
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements AfterContentInit {
  caseEvent: CaseEvent
  caseEventDefinition: CaseEventDefinition
  eventForm: EventForm
  eventFormDefinition: EventFormDefinition
  tangyFormEl:any
  throttledSaveLoaded:boolean;
  throttledSaveFiring:boolean;
  formResponse:any
  loaded = false
  lastResponseSeen:any
  window:any
  @ViewChild('container', {static: true}) container: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private hostElementRef: ElementRef,
    private router: Router,
    private caseService: CaseService,
    private tangyFormService: TangyFormService
  ) {
    this.window = window
  }

  async ngAfterContentInit() {
    setTimeout(() => this.hostElementRef.nativeElement.classList.add('hide-spinner'), 3000)
    this.route.params.subscribe(async params => {
      await this.caseService.load(params.caseId)
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
      this.tangyFormEl.addEventListener('submit', async _ => {
        // @TODO Here we want to prevent default and lock instead but we don't have lock yet so this is a workaround.
        setTimeout(async () => {
          let response = _.target.store.getState()
          this.throttledSaveResponse(response)
          this.caseService.markEventFormComplete(this.caseEvent.id, this.eventForm.id)
          await this.caseService.save()
          await this.router.navigate(['case', 'event', this.caseService.case._id, this.caseEvent.id])
        }, 1500)
      })
      this.loaded = true
    })
  }

  // Prevent parallel saves which leads to race conditions. Only save the first and then last state of the store.
  // Everything else in between we can ignore.
  async throttledSaveResponse(response) {
    this.lastResponseSeen = response
    // If already loaded, return.
    if (this.throttledSaveLoaded) {
      return
    }
    // Throttle this fire by waiting until last fire is done.
    if (this.throttledSaveFiring) {
      this.throttledSaveLoaded = true
      while (this.throttledSaveFiring) {
        await sleep(200)
      }
      this.throttledSaveLoaded = false
    }
    // Fire it.
    this.throttledSaveFiring = true
    await this.saveResponse(this.lastResponseSeen)
    this.throttledSaveFiring = false
  }

  async saveResponse(state) {
    let stateDoc = {}
    try {
      stateDoc = await this.tangyFormService.getResponse(state._id)
    } catch (e) {
      let r = await this.tangyFormService.saveResponse({...state, location: this.caseService.case.location})
      stateDoc = await this.tangyFormService.getResponse(state._id)
    }
    let newStateDoc = Object.assign({}, state, { _rev: stateDoc['_rev'] })
    await this.tangyFormService.saveResponse({
      ...newStateDoc,
      location: this.caseService.case.location,
      caseId: this.caseService.case._id,
      caseEventId: this.caseEvent.id,
      eventFormId: this.eventForm.id,
      participantId: this.eventForm.participantId || ''
    })
  }

}
