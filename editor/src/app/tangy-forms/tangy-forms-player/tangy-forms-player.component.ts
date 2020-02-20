import { Component, ViewChild, ElementRef, AfterContentInit, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {MatTabChangeEvent} from "@angular/material";

import { UserService } from '../../core/auth/_services/user.service';
import { WindowRef } from '../../core/window-ref.service';
import { TangyFormService } from '../tangy-form-service';
import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model';
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))


@Component({
  selector: 'app-tangy-forms-player',
  templateUrl: './tangy-forms-player.component.html',
  styleUrls: ['./tangy-forms-player.component.css']
})
export class TangyFormsPlayerComponent implements OnInit {

  throttledSaveLoaded;
  throttledSaveFiring;
  groupId;
  @Input() preventSave = false

  @ViewChild('container') container: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.groupId = params['groupId']
        ? params['groupId']
        : params['groupName']
      const responseId = params['responseId'];
      const response = <TangyFormResponseModel>await this.http.get(`/api/${this.groupId}/${responseId}`).toPromise()
      const formId = response.form.id
      const container = this.container.nativeElement
      let formHtml = await this.http.get(`/editor/${this.groupId}/content/${formId}/form.html`, {responseType: 'text'}).toPromise()
      container.innerHTML = formHtml
      let formEl = container.querySelector('tangy-form')
      if (responseId) {
        formEl.response = response 
      } else {
        formEl.newResponse()
      }
      // Save in the db if the form response is not complete, otherwise no point in generating new response revisions.
      if (!response.complete) {
        formEl.addEventListener('TANGY_FORM_UPDATE', _ => {
          let response = _.target.store.getState()
          this.throttledSaveResponse(response)
        })
        formEl.addEventListener('submit', _ => {
          setTimeout(() => window.history.back(), 1000)
        })
        if (formEl.getAttribute('id') === 'user-profile') {
          formEl.addEventListener('submit', _ => {
            _.preventDefault()
            let response = _.target.store.getState()
            this.throttledSaveResponse(response)
          })
        }
      }
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
    await this.http.post(`/api/${this.groupId}/${state._id}`, state).toPromise()
  }


}
