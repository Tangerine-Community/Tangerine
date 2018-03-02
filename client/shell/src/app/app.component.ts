import { Component, OnInit, QueryList, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import * as PouchDB from 'pouchdb';
import { Observable } from 'rxjs/Observable';
import { AuthenticationService } from './core/auth/_services/authentication.service';
import { UserService } from './core/auth/_services/user.service';
import { WindowRef } from './core/window-ref.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Tangerine Client v3.x.x';
  showNav;
  showUpdateAppLink;
  @ViewChild(MatSidenav) sidenav: QueryList<MatSidenav>;
  constructor(
    private windowRef: WindowRef, private userService: UserService,
    private authenticationService: AuthenticationService,
    private http: Http,
    private router: Router) {
    windowRef.nativeWindow.PouchDB = PouchDB;

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
    // setInterval(this.getGeolocationPosition, 1000);
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['login']);
    location.reload(); // @TODO find a way to load the page contents without reloading
  }
  async isAppUpdateAvailable() {
    const response = await this.http.get('../../release-uuid.txt').toPromise();
    const foundReleaseUuid = (response.text()).replace(/\n|\r/g, '');
    const storedReleaseUuid = localStorage.getItem('release-uuid');
    this.showUpdateAppLink = foundReleaseUuid === storedReleaseUuid ? false : true;
  }
  updateApp() {
    const currentPath = window.location.pathname;
    const storedReleaseUuid = localStorage.getItem('release-uuid');
    window.location.href = (currentPath.replace(`${storedReleaseUuid}\/shell\/`, ''));
  }

  getGeolocationPosition() {
    const options = {
      enableHighAccuracy: true
    };
    const queue = [];
    JSON.parse(localStorage.getItem('gpsQueue')) ? queue.push(JSON.parse(localStorage.getItem('gpsQueue'))) : null;
    // queue = queue.filter(entry => entry.timestamp > now - 5minutes).push({ ...GPS.getReading(), ... {timestamp: now})
    const currentPosition = navigator.geolocation.getCurrentPosition((position) => {

      console.log(position);
    },
      (err) => { },
      options);
  }
}
