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
  $beforeSubmit = new Subject()
  $submit = new Subject()
  $afterSubmit = new Subject()
  $resubmit = new Subject()
  $afterResubmit = new Subject()
  $saved = new Subject()
  rendered = false
  _inject = {}

  formInfo:FormInfo
  formTemplatesInContext:Array<FormTemplate>
  formEl:any

  throttledSaveLoaded;
  throttledSaveFiring;

  window:any;
  @ViewChild('container', {static: true}) container: ElementRef;
  constructor(
    private tangyFormsInfoService:TangyFormsInfoService,
    private tangyFormService: TangyFormService,
  ) {
    this.window = window
  }

  inject(name, value) {
    if (this.formEl) {
      this.formEl.inject(name, value)
    } else {
      this._inject[name] = value
    }
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
    // happens during testing
    if (!this.response && this.formResponseId) {
      this.response = await this.tangyFormService.getResponse(this.formResponseId)
    }
    this.formId = this.formId
      ? this.formId
      : formResponse['form']['id']
    this.formInfo = await this.tangyFormsInfoService.getFormInfo(this.formId)
    this.formTemplatesInContext = this.formInfo.templates ? this.formInfo.templates.filter(template => template.appContext === environment.appContext) : []
    if (this.templateId) {
      let  templateMarkup =  await this.tangyFormsInfoService.getFormTemplateMarkup(this.formId, this.templateId)
      eval(`this.container.nativeElement.innerHTML = \`${templateMarkup}\``)
    } else {
      let formVersionId
      if (window.location.hostname === 'localhost') {
        // We are in preview mode, use FormInfo.src for markup.
        formVersionId = '' 
      } else if (!this.formInfo.formVersions) {
        // No form versions defined, use FormInfo.src for markup.
        formVersionId = '' 
      } else if (this.formInfo.formVersions && !formResponse) {
        // We have form versions defined and we are creating a new form response. Let's use the version set for use in FormInfo.formVersionId.
        formVersionId = this.formInfo.formVersionId
      } else if (formResponse["formVersionId"]) {
        // We are resuming a Form Response with the version set. Use that.
        formVersionId = formResponse["formVersionId"]
      } else if (!formResponse["formVersionId"]) {
        // We are resuming a Form Response that has never heard of form versions. Use the FIRST form version listed.
        // This is useful for projects that did not start with using Form Versions. To get started, create two Form Versions
        // where the first form version is for Form Responses before Form Versions, and the second version is the new version
        // for all new form responses.
        formVersionId = this.formInfo.formVersions[0].id 
      }
      let  formHtml =  await this.tangyFormService.getFormMarkup(this.formId, formVersionId)
      // Put the form on the screen.
      const container = this.container.nativeElement
      container.innerHTML = formHtml
      let formEl = container.querySelector('tangy-form')
      this.formEl = formEl;
      for (let name of Object.keys(this._inject)) {
        this.formEl.inject(name, this._inject[name])
      }
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
      if (!this.skipSaving && !this.response.complete) {
        formEl.addEventListener('TANGY_FORM_UPDATE', _ => {
          let response = _.target.store.getState()
          this.throttledSaveResponse(response)
        })
      }
      formEl.addEventListener('before-submit', (event) => {
        this.$beforeSubmit.next(true)
      })
      formEl.addEventListener('submit', (event) => {
        if (this.preventSubmit) event.preventDefault() 
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
    this.$saved.next(state)
  }

  print() {
    window.print();
  }

}
