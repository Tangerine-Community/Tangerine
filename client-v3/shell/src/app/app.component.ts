import { Component, OnInit, QueryList, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import * as PouchDB from 'pouchdb';

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
  @ViewChild(MatSidenav) sidenav: QueryList<MatSidenav>;
  constructor(
    private windowRef: WindowRef,
    private userService: UserService,
    private http: Http,
    private authenticationService: AuthenticationService,
    private router: Router) {
    windowRef.nativeWindow.PouchDB = PouchDB;

  }

  async ngOnInit() {

    // Set location list as a global.
    const window = this.windowRef.nativeWindow;
    const res = await this.http.get('../content/location-list.json').toPromise();
    window.locationList = await res.json();

    this.showNav = this.authenticationService.isLoggedIn();
    this.authenticationService.currentUserLoggedIn$.subscribe((isLoggedIn) => {
      this.showNav = isLoggedIn;
    });
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['login']);
    location.reload(); // @TODO find a way to load the page contents without reloading
  }
}
