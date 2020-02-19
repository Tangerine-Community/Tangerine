import { DeviceService } from './../../../device/services/device.service';
import { AppConfigService } from './../../../shared/_services/app-config.service';
import { Component, AfterContentInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { updates } from './updates';
import PouchDB from 'pouchdb';
import { UserService } from '../../../shared/_services/user.service';
import { _TRANSLATE } from '../../../shared/translation-marker';
import { TranslateService } from '@ngx-translate/core';
import { Device } from 'src/app/device/classes/device.class';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})
export class UpdateComponent implements AfterContentInit {

  message = _TRANSLATE('Checking For Updates...');
  totalUpdatesApplied = 0;
  needsUpdating = false;
  complete = false;

  constructor(
    private router: Router,
    translate: TranslateService,
    private deviceService:DeviceService,
    private http: HttpClient,
    private appConfigService:AppConfigService,
    private userService: UserService
  ) { }

  async ngAfterContentInit() {
    if (localStorage.getItem('updateJustApplied')) {
      console.log("update has been applied")
      localStorage.setItem('updateJustApplied', '')
      this.message = _TRANSLATE('✓ Yay! You are up to date.')
      this.complete = true
      return
    }
    const appConfig = await this.appConfigService.getAppConfig()
    if (appConfig.syncProtocol === '2') {
      // Just use whichever is the logged in user.
      const db = await this.userService.getUserDatabase()
      await this.processUpdatesForUser(db, appConfig)
    } else {
      const usernames = await this.userService.getUsernames();
      for (const username of usernames) {
        const userDb = await new PouchDB(username);
        await this.processUpdatesForUser(userDb, appConfig)
      }
    }
    if (appConfig.syncProtocol === '2') {
      await this.deviceService.didUpdate()
    }
    localStorage.setItem('updateJustApplied', 'true')
    window.location.href = `${window.location.origin}${window.location.pathname}index.html`
  }

  async processUpdatesForUser(userDb, appConfig) {
    // Use try in case this is an old account where info doc was not created.
    let infoDoc = { _id: '', atUpdateIndex: 0 };
    try {
      infoDoc = await userDb.get('info');
    } catch (e) {
      await userDb.put({ _id: 'info', atUpdateIndex: 0 });
      infoDoc = await userDb.get('info');
    }
    let atUpdateIndex = infoDoc.hasOwnProperty('atUpdateIndex') ? infoDoc.atUpdateIndex : 0;
    const lastUpdateIndex = updates.length - 1;
    if (lastUpdateIndex !== atUpdateIndex) {
      this.needsUpdating = true;
      this.message = _TRANSLATE('Applying Updates...');
      let requiresViewsRefresh = false;
      while (lastUpdateIndex >= atUpdateIndex) {
        if (updates[atUpdateIndex].requiresViewsUpdate) {
          requiresViewsRefresh = true;
        }
        await updates[atUpdateIndex].script(userDb, appConfig, this.userService);
        this.totalUpdatesApplied++;
        atUpdateIndex++;
      }
      atUpdateIndex--;
      infoDoc.atUpdateIndex = atUpdateIndex;
      await userDb.put(infoDoc);
    }
    localStorage.setItem('updateJustApplied', 'true')
    window.location.href = window.location.href.replace(window.location.hash, 'index.html') 
  }

}
