import { Component, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../shared/_services/user.service';
import { Router } from '@angular/router';
import PouchDB from 'pouchdb';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { AppConfig } from 'src/app/shared/_classes/app-config.class';


@Component({
  selector: 'app-import-user-profile',
  templateUrl: './import-user-profile.component.html',
  styleUrls: ['./import-user-profile.component.css']
})
export class ImportUserProfileComponent implements AfterContentInit {

  STATE_SYNCING = 'STATE_SYNCING'
  STATE_INPUT = 'STATE_INPUT'
  appConfig: AppConfig
  state = this.STATE_INPUT
  docs;
  @ViewChild('userShortCode', {static: true}) userShortCodeInput: ElementRef;

  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: UserService,
    private appConfigService: AppConfigService
  ) {  }

  ngAfterContentInit() {
  }

  async onSubmit() {
    const username = this.userService.getCurrentUser()
    const db = await this.userService.getUserDatabase(await this.userService.getCurrentUser())
    const userAccount = await this.userService.getUserAccount(await this.userService.getCurrentUser())
    try {
      const profileToReplace = await db.get(userAccount.userUUID)
      await db.remove(profileToReplace)
    } catch(e) {
      // It's ok if this fails. It's probably because they are trying again and the profile has already been deleted.
    }
    this.state = this.STATE_SYNCING
    this.appConfig = await this.appConfigService.getAppConfig()
    const shortCode = this.userShortCodeInput.nativeElement.value
    this.docs = await this.http.get(`${this.appConfig.serverUrl}api/${this.appConfig.groupId}/responsesByUserProfileShortCode/${shortCode}`).toPromise()
    const newUserProfile = this.docs.find(doc => doc.form && doc.form.id === 'user-profile')
    await this.userService.saveUserAccount({...userAccount, userUUID: newUserProfile._id, initialProfileComplete: true})
    for (let doc of this.docs) {
      delete doc._rev
      await db.put(doc)
    }
    this.router.navigate([`/${this.appConfig.homeUrl}`] );
  }

}
