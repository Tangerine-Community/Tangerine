import { environment } from './../../../environments/environment';
import { FormInfo, FormTemplate } from 'src/app/tangy-forms/classes/form-info.class';
import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model.js';
import { Subject } from 'rxjs';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { _TRANSLATE } from '../../shared/translation-marker';
import { TangyFormService } from '../tangy-form.service';
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))


@Component({
  selector: 'app-tangy-forms-player',
  templateUrl: './tangy-forms-player.component.html',
  styleUrls: ['./tangy-forms-player.component.css']
})
export class TangyFormsPlayerComponent {

  // Use one of three to do different things.
  // 1. Use this to have the component load the response for you. 
  @Input('formResponseId') formResponseId:string
  // 2. Use this if you want to attach the form response yourself.
  @Input('response') response:TangyFormResponseModel
  // 3. Use this is you want a new form response.
  @Input('formId') formId:string

  @Input('templateId') templateId:string
  @Input('location') location:any
  @Input('skipSaving') skipSaving = false
  @Input('preventSubmit') preventSubmit = false
  @Input('metadata') metadata:any

  $rendered = new Subject()
  $submit = new Subject()
  $afterSubmit = new Subject()
  $resubmit = new Subject()
  $afterResubmit = new Subject()
  rendered = false

  formInfo:FormInfo
  formTemplatesInContext:Array<FormTemplate>
  formEl:any

  throttledSaveLoaded;
  throttledSaveFiring;

  window:any;
  @ViewChild('container', {static: true}) container: ElementRef;
  constructor(
    private tangyFormsInfoService:TangyFormsInfoService,
    private tangyFormService: TangyFormService
  ) {
    this.window = window
  }

  isDirty() {
    if (this.formEl) {
      const state = this.formEl.store.getState()
      const isDirty = state.items.some((acc, item) => item.isDirty)
      return isDirty
    } else {
      return true
    }
  }

  isComplete() {
    if (this.formEl) {
      return this.formEl.store.getState().form.complete
    } else {
      return true
    }
  }

  unlock() {
    this.formEl.unlock()
  }

  async render() {
    // Get form ingredients.
    const formResponse = this.response
      ? new TangyFormResponseModel(this.response)
      : this.formResponseId
        ? new TangyFormResponseModel(await this.tangyFormService.getResponse(this.formResponseId))
        : ''
    const response = formResponse
    this.formId = this.formId
      ? this.formId
      : formResponse['form']['id']
    this.formInfo = await this.tangyFormsInfoService.getFormInfo(this.formId)
    this.formTemplatesInContext = this.formInfo.templates ? this.formInfo.templates.filter(template => template.appContext === environment.appContext) : []
    const formVersionId = formResponse["formVersionId"] ? formResponse["formVersionId"] : this.formInfo.formVersionId
    if (this.templateId) {
      let  templateMarkup =  await this.tangyFormsInfoService.getFormTemplateMarkup(this.formId, this.templateId)
      const response = formResponse
      eval(`this.container.nativeElement.innerHTML = \`${templateMarkup}\``)
    } else {
      let  formHtml =  await this.tangyFormService.getFormMarkup(this.formId, formVersionId)
      // Put the form on the screen.
      const container = this.container.nativeElement
      container.innerHTML = formHtml
      let formEl = container.querySelector('tangy-form')
      this.formEl = formEl;
      // Put a response in the store by issuing the FORM_OPEN action.
      if (formResponse) {
        formEl.response = formResponse
      } else {
        formEl.newResponse()
        this.formResponseId = formEl.response._id
        formEl.response.formVersionId = this.formInfo.formVersionId
        this.throttledSaveResponse(formEl.response)
      }
      this.response = formEl.response
      // Listen up, save in the db.
      if (!this.skipSaving) {
        formEl.addEventListener('TANGY_FORM_UPDATE', _ => {
          let response = _.target.store.getState()
          this.throttledSaveResponse(response)
        })
      }
      formEl.addEventListener('submit', async (event) => {
        if (this.preventSubmit) event.preventDefault() 
        while (this.throttledSaveFiring === true) {
          await sleep(1000)
        }
        this.$submit.next(true)
      })
      formEl.addEventListener('after-submit', async (event) => {
        if (this.preventSubmit) event.preventDefault() 
        while (this.throttledSaveFiring === true) {
          await sleep(1000)
        }
        this.$afterSubmit.next(true)
      })
      formEl.addEventListener('resubmit', async (event) => {
        if (this.preventSubmit) event.preventDefault() 
        while (this.throttledSaveFiring === true) {
          await sleep(1000)
        }
        this.$resubmit.next(true)
      })
      formEl.addEventListener('after-resubmit', async (event) => {
        if (this.preventSubmit) event.preventDefault() 
        while (this.throttledSaveFiring === true) {
          await sleep(1000)
        }
        this.$afterResubmit.next(true)
      })
    }
    this.$rendered.next(true)
    this.rendered = true
  }

  setTemplate(templateId) {
    this.templateId = templateId
    this.render()
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
    stateDoc = await this.tangyFormService.getResponse(state._id)
    if (stateDoc && stateDoc['complete'] && state.complete && stateDoc['form'] && !stateDoc['form'].hasSummary) {
      // Since what is in the database is complete, and it's still complete, and it doesn't have 
      // a summary where they might add some input, don't save! They are probably reviewing data.
    } else {
      if (!stateDoc) {
        let r = await this.tangyFormService.saveResponse(state)
        stateDoc = await this.tangyFormService.getResponse(state._id)
      }
      await this.tangyFormService.saveResponse({
        ...state,
        _rev: stateDoc['_rev'],
        location: this.location || state.location,
        ...this.metadata
      })
    }
    this.response = state
  }

  print() {
    window.print();
  }

}
