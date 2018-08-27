import { Component, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { UserService } from '../../core/auth/_services/user.service';
import { WindowRef } from '../../core/window-ref.service';
import { TangyFormService } from '../tangy-form-service';
import 'tangy-form/tangy-form.js';
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))


@Component({
  selector: 'app-tangy-forms-player',
  templateUrl: './tangy-forms-player.component.html',
  styleUrls: ['./tangy-forms-player.component.css']
})
export class TangyFormsPlayerComponent implements AfterContentInit {
  formId;
  responseId;
  throttledSaveLoaded;
  throttledSaveFiring;
  groupName;
  @ViewChild('container') container: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private windowRef: WindowRef
  ) { }

  async ngAfterContentInit() {
    this.route.queryParams.subscribe(async params => {
      let formInfo; let formItemHtml;
      this.formId = params['formId'];
      this.groupName = params['groupName']
      this.responseId = params['responseId'];
      //const formResponse = await tangyFormService.getResponse(this.responseId);
      const formResponse = {}
      const container = this.container.nativeElement
      let formHtml = await this.http.get(`/editor/${this.groupName}/content/${this.formId}/form.html`, {responseType: 'text'}).toPromise()
      container.innerHTML = formHtml
      let formEl = container.querySelector('tangy-form')
      if (this.responseId) {
        formEl.response = await this.http.get(`/api/${this.groupName}/${this.responseId}`).toPromise()
      } else {
        formEl.newResponse()
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
    await this.http.post(`/api/${this.groupName}/${state._id}`, state).toPromise()
  }


}
