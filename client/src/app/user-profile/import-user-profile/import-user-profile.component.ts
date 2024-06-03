import { Component, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../shared/_services/user.service';
import { Router } from '@angular/router';
import PouchDB from 'pouchdb';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { AppConfig } from 'src/app/shared/_classes/app-config.class';
import { _TRANSLATE } from 'src/app/shared/translation-marker';


@Component({
  selector: 'app-import-user-profile',
  templateUrl: './import-user-profile.component.html',
  styleUrls: ['./import-user-profile.component.css']
})
export class ImportUserProfileComponent implements AfterContentInit {

  STATE_SYNCING = 'STATE_SYNCING'
  STATE_INPUT = 'STATE_INPUT'
  STATE_ERROR = 'STATE_ERROR'
  STATE_NOT_FOUND ='STATE_NOT_FOUND'
  appConfig: AppConfig
  state = this.STATE_INPUT
  docs;
  totalDocs;
  processedDocs = 0;
  userAccount;
  db;
  shortCode
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
    this.db = await this.userService.getUserDatabase(username)
    this.userAccount = await this.userService.getUserAccount(username)
    try {
      const profileToReplace = await this.db.get(this.userAccount.userUUID)
      await this.db.remove(profileToReplace)
    } catch(e) {
      // It's ok if this fails. It's probably because they are trying again and the profile has already been deleted.
    }
    await this.startSyncing()
  }

  async startSyncing(){
    try {
      this.appConfig = await this.appConfigService.getAppConfig()
      this.shortCode = this.userShortCodeInput.nativeElement.value;
      let newUserProfile = await this.http.get(`${this.appConfig.serverUrl}/api/${this.appConfig.groupId}/responsesByUserProfileShortCode/${this.shortCode}/?userProfile=true`).toPromise()
      if(!!newUserProfile){
        this.state = this.STATE_SYNCING
        await this.userService.saveUserAccount({ ...this.userAccount, userUUID: newUserProfile['_id'], initialProfileComplete: true })
        this.totalDocs = (await this.http.get(`${this.appConfig.serverUrl}/api/${this.appConfig.groupId}/responsesByUserProfileShortCode/${this.shortCode}/?totalRows=true`).toPromise())['totalDocs']
        const docsToQuery = 1000;
        let processedDocs = +localStorage.getItem('processedDocs') || 0;
        while (processedDocs < this.totalDocs) {
          this.docs = await this.http.get(`${this.appConfig.serverUrl}/api/${this.appConfig.groupId}/responsesByUserProfileShortCode/${this.shortCode}/${docsToQuery}/${processedDocs}`).toPromise()
          for (let doc of this.docs) {
            delete doc._rev
            await this.db.put(doc)
          }
          processedDocs += this.docs.length;
          this.processedDocs = processedDocs
          localStorage.setItem('processedDocs', String(processedDocs))
        }
      } else{
        this.state = this.STATE_NOT_FOUND
      }
      this.router.navigate([`/${this.appConfig.homeUrl}`] );
      } catch (error) {
        this.state = this.STATE_ERROR
      }
  }

}