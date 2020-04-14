import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { Component, ViewChild, ElementRef, AfterContentInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { CaseManagementService } from '../../case-management/_services/case-management.service';
import { UserService } from '../../shared/_services/user.service';
import { _TRANSLATE } from '../../shared/translation-marker';
import { TangyFormService } from '../tangy-form.service';
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))


@Component({
  selector: 'app-tangy-forms-player',
  templateUrl: './tangy-forms-player.component.html',
  styleUrls: ['./tangy-forms-player.component.css']
})
export class TangyFormsPlayerComponent implements AfterContentInit {

  @Input('formId') formId:string
  @Input('viewId') viewId:string
  @Input('formResponseId') formResponseId:string

  throttledSaveLoaded;
  throttledSaveFiring;

  formEl;
  window:any;
  @ViewChild('container', {static: true}) container: ElementRef;
  constructor(
    private tangyFormsInfoService:TangyFormsInfoService,
    private service: TangyFormService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private userService: UserService,
  ) {
    this.window = window
  }

  isDirty() {
    const state = this.formEl.store.getState()
    const isDirty = state.items.some((acc, item) => item.isDirty)
    return isDirty
  }

  isComplete() {
    return this.formEl.store.getState().form.complete
  }

  async ngAfterContentInit() {
    //
    this.window.tangyLocationFilterBy = (await this.userService.getUserLocations()).join(',')
    // Get form ingredients.
    const formResponse = this.formResponseId
      ? await this.service.getResponse(this.formResponseId)
      : ''
    this.formId = this.formId
      ? this.formId
      : formResponse.form.id
    const formInfo = await this.tangyFormsInfoService.getFormInfo(this.formId);
    let  formHtml =  await this.http.get(formInfo.src, {responseType: 'text'}).toPromise();
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
    }
    // Listen up, save in the db.
    formEl.addEventListener('TANGY_FORM_UPDATE', _ => {
      let response = _.target.store.getState()
      this.throttledSaveResponse(response)
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
      stateDoc = await this.service.getResponse(state._id)
    } catch (e) {
      let r = await this.service.saveResponse(state)
      stateDoc = await this.service.getResponse(state._id)
    }
    let newStateDoc = Object.assign({}, state, { _rev: stateDoc['_rev'] })
    await this.service.saveResponse(newStateDoc)
  }

}
