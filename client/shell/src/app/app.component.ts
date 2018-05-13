import { Component, OnInit, QueryList, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthenticationService } from './core/auth/_services/authentication.service';
import { UserService } from './core/auth/_services/user.service';
import { WindowRef } from './core/window-ref.service';
import { updates } from './core/update/update/updates';
import { TangyFormService } from './tangy-forms/tangy-form-service.js';
import PouchDB from 'pouchdb';
import { TranslateService } from '@ngx-translate/core';
import { _TRANSLATE } from './shared/translation-marker';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showNav;
  showUpdateAppLink;
  updateIsRunning = false;
  @ViewChild(MatSidenav) sidenav: QueryList<MatSidenav>;
  constructor(
    private windowRef: WindowRef, private userService: UserService,
    private authenticationService: AuthenticationService,
    private http: Http,
    private router: Router,
    translate: TranslateService
  ) {
    windowRef.nativeWindow.PouchDB = PouchDB;
    translate.setDefaultLang('translation');
    translate.use('translation');
  }

  async ngOnInit() {
    // Set location list as a global.
    const window = this.windowRef.nativeWindow;
    const res = await this.http.get('../content/location-list.json').toPromise();
    window.locationList = res.json();

    this.showNav = this.authenticationService.isLoggedIn();
    this.authenticationService.currentUserLoggedIn$.subscribe((isLoggedIn) => {
      this.showNav = isLoggedIn;
    });
    this.isAppUpdateAvailable();
    setInterval(this.getGeolocationPosition, 5000);
    this.checkIfUpdateScriptRequired();
    // setInterval(this.getGeolocationPosition, 1000);
    // Initialize tangyFormService in case any views need to be updated.
    const currentUser = await this.authenticationService.getCurrentUser();
    const tangyFormService = new TangyFormService({ databaseName: currentUser });
    tangyFormService.initialize();
  }

  async checkIfUpdateScriptRequired() {
    const usersDb = new PouchDB('users');
    const response = await usersDb.allDocs({ include_docs: true });
    const usernames = response
      .rows
      .map(row => row.doc)
      .filter(doc => doc.hasOwnProperty('username'))
      .map(doc => doc.username);
    for (const username of usernames) {
      const userDb = await new PouchDB(username);
      // Use try in case this is an old account where info doc was not created.
      let infoDoc = { _id: '', atUpdateIndex: 0 };
      try {
        infoDoc = await userDb.get('info');
      } catch (e) {
        await userDb.put({ _id: 'info', atUpdateIndex: 0 });
        infoDoc = await userDb.get('info');
      }
      const atUpdateIndex = infoDoc.hasOwnProperty('atUpdateIndex') ? infoDoc.atUpdateIndex : 0;
      const lastUpdateIndex = updates.length - 1;
      if (lastUpdateIndex !== atUpdateIndex) {
        this.router.navigate(['/update']);
      }
    }
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['login']);
  }
  async isAppUpdateAvailable() {
    try {
      const response = await this.http.get('../../release-uuid.txt').toPromise();
      const foundReleaseUuid = (response.text()).replace(/\n|\r/g, '');
      const storedReleaseUuid = localStorage.getItem('release-uuid');
      this.showUpdateAppLink = foundReleaseUuid === storedReleaseUuid ? false : true;
    } catch (e) {
    }
  }
  updateApp() {
    if (window.isCordovaApp) {
      console.log('Running from APK');
      const installationCallback = (error) => {
        if (error) {
          console.log('Failed to install the update with error code:' + error.code);
          console.log(error.description);
          this.updateIsRunning = false;
        } else {
          console.log('Update Instaled');
          this.updateIsRunning = false;
        }
      };
      const updateCallback = (error, data) => {
        console.log('data: ' + JSON.stringify(data));
        if (error) {
          console.log('error: ' + JSON.stringify(error));
          alert('No Update: ' + JSON.stringify(error.description));
        } else {
          console.log('Update is Loaded');
          if (window.confirm(_TRANSLATE('An update is available. Be sure to first sync your data before installing the update. If you have not done this, click `Cancel`. If you are ready to install the update, click `Yes`'))) {
            this.updateIsRunning = true;
            console.log('Installing Update');
            window.chcp.installUpdate(installationCallback);
          } else {
            console.log('Cancelled install; did not install update.');
            this.updateIsRunning = false;
          }
        }
      };
      window.chcp.fetchUpdate(updateCallback);
    } else {
      const currentPath = window.location.pathname;
      const storedReleaseUuid = localStorage.getItem('release-uuid');
      window.location.href = (currentPath.replace(`${storedReleaseUuid}\/shell\/`, ''));
    }

  }

  getGeolocationPosition() {
    const options = {
      enableHighAccuracy: true
    };
    const queue = JSON.parse(localStorage.getItem('gpsQueue')) ? (JSON.parse(localStorage.getItem('gpsQueue'))) : null;
    navigator.geolocation.getCurrentPosition((position: Position) => {
      // Accuracy is in meters, a lower reading is better
      if (!queue || (typeof queue !== 'undefined' && ((position.timestamp - queue.timestamp) / 1000) >= 30) ||
        queue.accuracy >= position.coords.accuracy) {
        const x = {
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed,
          timestamp: position.timestamp
        };
        localStorage.setItem('gpsQueue', JSON.stringify(x));
      } else { console.log(position); }
    },
      (err) => { },
      options);
  }
}
