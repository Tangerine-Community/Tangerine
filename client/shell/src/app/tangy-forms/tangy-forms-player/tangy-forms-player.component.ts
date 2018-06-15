import { Component, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CaseManagementService } from '../../case-management/_services/case-management.service';
import { UserService } from '../../core/auth/_services/user.service';
import { WindowRef } from '../../core/window-ref.service';
import { _TRANSLATE } from '../../shared/translation-marker';
import { TangyFormService } from '../tangy-form-service';
import 'tangy-form/tangy-form.js';

@Component({
  selector: 'app-tangy-forms-player',
  templateUrl: './tangy-forms-player.component.html',
  styleUrls: ['./tangy-forms-player.component.css']
})
export class TangyFormsPlayerComponent implements AfterContentInit {
  formUrl;
  formIndex: number;
  responseId;
  @ViewChild('container') container: ElementRef;
  constructor(
    private caseManagementService: CaseManagementService,
    private route: ActivatedRoute,
    private userService: UserService,
    private windowRef: WindowRef
  ) { }

  async ngAfterContentInit() {
    this.route.queryParams.subscribe(async params => {
      this.formIndex = +params['formIndex'] || 0;
      this.responseId = params['responseId'];
      const formInfo = await this.getFormInfoByIndex(this.formIndex);
      const userDbName = await this.userService.getUserDatabase();
      const tangyFormService = new TangyFormService({ databaseName: userDbName });
      const formResponseDocs = await tangyFormService.getResponsesByFormId(formInfo.id);
      const container = this.container.nativeElement
      let formHtml = await fetch(formInfo.src)
      container.innerHTML = await formHtml.text()
      let formEl = container.querySelector('tangy-form')
      formEl.addEventListener('ALL_ITEMS_CLOSED', async () => {
        const profileDoc = formEl.store.getState()
        await tangyFormService.saveResponse(profileDoc)
      })
      // Put a response in the store by issuing the FORM_OPEN action.
      if (formResponseDocs.length > 0) {
        formEl.store.dispatch({ type: 'FORM_OPEN', response: formResponseDocs[0] })
      } 

    });
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

}
