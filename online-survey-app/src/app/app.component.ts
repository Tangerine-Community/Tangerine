import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'online-survey-app';
  isLoggedIn = true;
  languageDirection = 'ltr';
  appName = 'Evano';
}
