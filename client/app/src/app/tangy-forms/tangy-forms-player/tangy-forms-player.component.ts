import { Component, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { CaseManagementService } from '../../case-management/_services/case-management.service';
import { UserService } from '../../core/auth/_services/user.service';
import { WindowRef } from '../../core/window-ref.service';
import { _TRANSLATE } from '../../shared/translation-marker';
import { TangyFormService } from '../tangy-form-service';
import 'tangy-form/tangy-form.js';
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))


@Component({
  selector: 'app-tangy-forms-player',
  templateUrl: './tangy-forms-player.component.html',
  styleUrls: ['./tangy-forms-player.component.css']
})
export class TangyFormsPlayerComponent implements AfterContentInit {
  formUrl;
  formIndex: number;
  responseId;
  throttledSaveLoaded;
  throttledSaveFiring;
  service: TangyFormService;
  formId;
  formItem;
  formTitle;
  formSrc;
  @ViewChild('container') container: ElementRef;
  constructor(
    private caseManagementService: CaseManagementService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private userService: UserService,
    private windowRef: WindowRef
  ) { }

  async ngAfterContentInit() {
    this.route.queryParams.subscribe(async params => {
      let formInfo; let formItemHtml;
      this.formIndex = +params['formIndex'] || 0;
      this.formId = params['formId'];
      this.formItem = params['itemId'];
      this.formTitle = params['title'];
      this.formSrc = params['src'];
      this.responseId = params['responseId'];
      if (typeof this.formId !== 'undefined') {
        formInfo = await this.getFormInfoById(this.formId);
      } else {
        formInfo = await this.getFormInfoByIndex(this.formIndex);
      }
      if (typeof this.formItem !== 'undefined') {
        // ./assets/grade-1/form.html
        let tangyFormWidgetStart = "<tangy-form has-summary linear-mode hide-closed-items id=\"" + this.formItem
          + "\" on-change=\"\">\n"
        let tangyFormWidgetEnd = "</tangy-form>"
        let tangyFormItem = "  <tangy-form-item src=\"" + this.formSrc + "\" id=\"" + this.formItem + "\" title=\"" + this.formTitle + "\" hide-back-button></tangy-form-item>\n"
        formItemHtml = tangyFormWidgetStart + tangyFormItem + tangyFormWidgetEnd;
        let formItemInfo = {
          // title: formInfo['title'] + this.formId,
          title: this.formTitle,
          // src: "./assets/" + this.formId + "/" + this.formItem + ".html",
          src: this.formSrc,
          id: this.formId
        }
        formInfo = formItemInfo;
      }
      const userDbName = await this.userService.getUserDatabase();
      const tangyFormService = new TangyFormService({ databaseName: userDbName });
      this.service = tangyFormService
      const formResponse = await tangyFormService.getResponse(this.responseId);
      const container = this.container.nativeElement
      let formHtml
      if (typeof formItemHtml !== 'undefined') {
        formHtml = formItemHtml
      } else {
        formHtml =  await this.http.get(formInfo.src, {responseType: 'text'}).toPromise();
      }
      container.innerHTML = formHtml
      let formEl = container.querySelector('tangy-form')
      // Put a response in the store by issuing the FORM_OPEN action.
      if (formResponse) {
        formEl.store.dispatch({ type: 'FORM_OPEN', response: formResponse })
      } else {
        //formEl.store.dispatch({ type: 'FORM_OPEN', response: {} })
      }
      // Listen up, save in the db.
      formEl.addEventListener('TANGY_FORM_UPDATE', _ => {
        let response = _.target.store.getState()
        this.throttledSaveResponse(response)
      })
    });
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

  async getFormInfoByIndex(index = 0) {
    try {
      const userDB = await this.userService.getUserDatabase();
      const form = await this.caseManagementService.getFormList();
      if (!(index >= form.length)) {
        // Relative path to tangy forms app.
        return form[index]
      }
    } catch (err) { console.log(err) }

  }

  async getFormInfoById(formId) {
    try {
      const userDB = await this.userService.getUserDatabase();
      const form = await this.caseManagementService.getFormList();
      let selectedForm = form.find(testForm => (testForm.id === formId) ? true : false)
      return selectedForm;
    } catch (err) { console.log(err) }

  }

}
