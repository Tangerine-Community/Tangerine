import { Component, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../core/auth/_services/user.service';
import { Router } from '@angular/router';
import PouchDB from 'pouchdb';

@Component({
  selector: 'app-import-user-profile',
  templateUrl: './import-user-profile.component.html',
  styleUrls: ['./import-user-profile.component.css']
})
export class ImportUserProfileComponent implements AfterContentInit {
  appConfig;
  docs;

  @ViewChild('userShortCode') userShortCodeInput: ElementRef;

  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: UserService
  ) {  }

  ngAfterContentInit() {
  }

  async onSubmit() {
    this.appConfig = await this.http.get('./assets/app-config.json').toPromise()
    const userDbName = await this.userService.getUserDatabase();
    const db = new PouchDB(userDbName)
    const shortCode = this.userShortCodeInput.nativeElement.value
    this.docs = await this.http.get(`${this.appConfig.serverUrl}api/${this.appConfig.groupName}/responsesByUserProfileShortCode/${shortCode}`).toPromise()
    this.docs.forEach(doc => delete doc._rev)
    await db.bulkDocs(this.docs);
    this.router.navigate([`/${this.appConfig.homeUrl}`] );
  }

}
