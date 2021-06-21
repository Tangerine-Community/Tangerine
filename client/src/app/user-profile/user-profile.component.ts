import { UserAccount } from './../shared/_classes/user-account.class';
import { AfterContentInit, ElementRef, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { UserService } from '../shared/_services/user.service';
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
  @ViewChild('container', {static: true}) container: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private userService: UserService,
    private appConfigService: AppConfigService
  ) { }

  async ngAfterContentInit() {
    const appConfig = await this.appConfigService.getAppConfig();
    const userAccount = await this.userService.getUserAccount(this.userService.getCurrentUser())
    const homeUrl = appConfig.homeUrl;
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || homeUrl;
    const userDb = await this.userService.getUserDatabase();
    const container = this.container.nativeElement
    let formHtml =  await this.http.get('./assets/user-profile/form.html', {responseType: 'text'}).toPromise();
    container.innerHTML = formHtml
    let formEl = container.querySelector('tangy-form')
    formEl.addEventListener('submit', async (event) => {
      event.preventDefault()
      const profileDoc = formEl.store.getState()
      await userDb.put(profileDoc)
      if (!userAccount.initialProfileComplete) {
        await this.userService.saveUserAccount(<UserAccount>{ ...userAccount, initialProfileComplete:true })
      }
      await this.userService.setCurrentUser(this.userService.getCurrentUser())
      this.router.navigate([this.returnUrl]);
    })
    try {
      formEl.response = await userDb.get(userAccount.userUUID)
    } catch(e) {
      formEl.newResponse()
    }
  }

}
