import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { environment } from './../../../environments/environment';
import { FormInfo, FormTemplate } from 'src/app/tangy-forms/classes/form-info.class';
import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model.js';
import { Subject } from 'rxjs';
import { Component, ViewChild, ElementRef, AfterContentInit, Input, OnInit } from '@angular/core';
import { _TRANSLATE } from '../../shared/translation-marker';
import { TangyFormService } from '../tangy-form.service';
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))


@Component({
  selector: 'app-tangy-forms-player',
  templateUrl: './tangy-forms-player.component.html',
  styleUrls: ['./tangy-forms-player.component.css']
})
export class TangyFormsPlayerComponent {

  @Input('formId') formId:string
  @Input('templateId') templateId:string
  @Input('formResponseId') formResponseId:string
  @Input('location') location:any

  $rendered = new Subject()
  $submit = new Subject()
  rendered = false

  formInfo:FormInfo
  formTemplatesInContext:Array<FormTemplate>
  response:any

  throttledSaveLoaded;
  throttledSaveFiring;

  formEl;
  window:any;
  @ViewChild('container', {static: true}) container: ElementRef;
  constructor(
    private tangyFormsInfoService:TangyFormsInfoService,
    private service: TangyFormService,
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

  async render() {
    //
    // Get form ingredients.
    const formResponse = this.formResponseId
      ? new TangyFormResponseModel(await this.service.getResponse(this.formResponseId))
      : ''
    this.formId = this.formId
      ? this.formId
      : formResponse['form']['id']
    this.formInfo = await this.tangyFormsInfoService.getFormInfo(this.formId)
    this.formTemplatesInContext = this.formInfo.templates ? this.formInfo.templates.filter(template => template.appContext === environment.appContext) : []
    if (this.templateId) {
      let  templateMarkup =  await this.tangyFormsInfoService.getFormTemplateMarkup(this.formId, this.templateId)
      const response = formResponse
      eval(`this.container.nativeElement.innerHTML = \`${templateMarkup}\``)
    } else {
      let  formHtml =  await this.tangyFormsInfoService.getFormMarkup(this.formId)
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
      }
      this.response = formEl.response
      // Listen up, save in the db.
      formEl.addEventListener('TANGY_FORM_UPDATE', _ => {
        let response = _.target.store.getState()
        this.throttledSaveResponse(response)
      })
      formEl.addEventListener('submit', () => {
        this.$submit.next(true)
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
    try {
      stateDoc = await this.service.getResponse(state._id)
    } catch (e) {
      let r = await this.service.saveResponse(state)
      stateDoc = await this.service.getResponse(state._id)
    }
    await this.service.saveResponse({
      state,
      _rev: stateDoc['_rev'],
      location: this.location
    })
    this.response = state
  }

  print() {
    window.print(); 
  }

}
