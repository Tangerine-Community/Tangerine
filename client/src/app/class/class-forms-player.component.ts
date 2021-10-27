import { environment } from '../../environments/environment';
import { FormInfo, FormTemplate } from 'src/app/tangy-forms/classes/form-info.class';
import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model.js';
import { Subject } from 'rxjs';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { _TRANSLATE } from '../shared/translation-marker';
import { TangyFormService } from '../tangy-forms/tangy-form.service';
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))


@Component({
  selector: 'app-class-forms-player',
  templateUrl: './class-forms-player.component.html',
  styleUrls: ['../tangy-forms/tangy-forms-player/tangy-forms-player.component.css']
})
export class ClassFormsPlayerComponent {

  @Input('response') response:TangyFormResponseModel
  @Input('formHtml') formHtml:string
  @ViewChild('container', {static: true}) container: ElementRef;
  $afterSubmit = new Subject()
  rendered = false
  window:any;

  constructor(
    private tangyFormsInfoService:TangyFormsInfoService,
    private tangyFormService: TangyFormService
  ) {
    this.window = window
  }

  async render() {
    // Get form ingredients.
    const formResponse = this.response
      ? new TangyFormResponseModel(this.response)
      : undefined
    const container = this.container.nativeElement
    container.innerHTML = this.formHtml
    let formEl = container.querySelector('tangy-form')
    const itemId = formEl.querySelector('tangy-form-item').getAttribute('id')
    if (formResponse && formResponse.items.find(item => item.id === itemId)) {
      formEl.response = {
        ...formResponse,
        items: formResponse.items.filter(item => item.id === itemId)
      }
    } else {
      formEl.newResponse()
    }
    formEl.addEventListener('after-submit', async (event) => {
      this.$afterSubmit.next(formEl.response)
    })
    this.rendered = true
  }



}
