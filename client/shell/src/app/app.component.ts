import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MdSidenav } from '@angular/material';
import { Router } from '@angular/router';
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
  @ViewChildren('sidenav') sidenav: QueryList<MdSidenav>;
  constructor(
    windowRef: WindowRef, private userService: UserService,
    private authenticationService: AuthenticationService,
    private router: Router) {
    windowRef.nativeWindow.PouchDB = PouchDB;
  }

  ngOnInit() {
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
