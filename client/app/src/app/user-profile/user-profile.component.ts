import { AfterContentInit, ElementRef, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { UserService } from '../core/auth/_services/user.service';
import { TangyFormService } from '../tangy-forms/tangy-form-service';
import 'tangy-form/tangy-form.js';
import {AppConfigService} from "../shared/_services/app-config.service";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements AfterContentInit {

  tangyFormSrc: any;
  tangyFormResponse: {};
  returnUrl: string; // stores the value of the url to redirect to after login
  @ViewChild('container') container: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private userService: UserService,
    private appConfigService: AppConfigService
  ) { }

  async ngAfterContentInit() {
    const appConfig = await this.appConfigService.getAppConfig();
    const homeUrl = appConfig.homeUrl;
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || homeUrl;
    const userDbName = await this.userService.getUserDatabase();
    const tangyFormService = new TangyFormService({ databaseName: userDbName });
    const profileDocs = await tangyFormService.getResponsesByFormId('user-profile');
    const container = this.container.nativeElement
    let formHtml =  await this.http.get('./assets/user-profile/form.html', {responseType: 'text'}).toPromise();
    container.innerHTML = formHtml
    let formEl = container.querySelector('tangy-form')
    formEl.addEventListener('ALL_ITEMS_CLOSED', async () => {
      const profileDoc = formEl.store.getState()
      await tangyFormService.saveResponse(profileDoc)
      this.router.navigate([this.returnUrl]);
    })
    // Put a response in the store by issuing the FORM_OPEN action.
    if (profileDocs.length > 0) {
      formEl.store.dispatch({ type: 'FORM_OPEN', response: profileDocs[0] })
    }
  }

}
