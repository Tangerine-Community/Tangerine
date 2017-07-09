import { Component } from '@angular/core';
import { WindowRef  } from './core/window-ref.service';
import * as PouchDB from 'pouchdb';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Tangerine Client v3.x.x';
  constructor(windowRef: WindowRef) {
    windowRef.nativeWindow.PouchDB = PouchDB;
  }
}
