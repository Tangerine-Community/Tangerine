import { AfterContentInit, ElementRef, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { UserService } from '../shared/_services/user.service';
import { TangyFormService } from '../tangy-forms/tangy-form-service';
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
    const username = localStorage.getItem('currentUser')
    const userDb = await this.userService.getUserDatabase(username);
    const userProfile = await this.userService.getUserProfile(username)
    const container = this.container.nativeElement
    let formHtml =  await this.http.get('./assets/user-profile/form.html', {responseType: 'text'}).toPromise();
    container.innerHTML = formHtml
    let formEl = container.querySelector('tangy-form')
    formEl.response = userProfile
    formEl.addEventListener('submit', async (event) => {
      event.preventDefault()
      const profileDoc = formEl.store.getState()
      // Queue for upload.
      if (profileDoc.uploadDatetime) {
        profileDoc.uploadDatetime = null
      }
      await userDb.put(profileDoc)
      this.router.navigate([this.returnUrl]);
    })
  }

}
