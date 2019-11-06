import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  @ViewChild('form') form: ElementRef;
  translations:any
  window:any
  languageCode = 'en'
  constructor(
    private http: HttpClient
  ) { 
    this.languageCode = localStorage.getItem('languageCode')
  }

  async ngOnInit() {
    this.translations = await this.http.get('./assets/translations.json').toPromise();
    this.form.nativeElement.querySelector('[type="submit"]').addEventListener('click', (event) => {
      const selectedLanguage = this.translations.find(languageInfo => languageInfo.languageCode === this.form.nativeElement.querySelector('[name=translation]').value)
      localStorage.setItem('languageCode', selectedLanguage.languageCode)
      localStorage.setItem('languageDirection', selectedLanguage.languageDirection)
      window.location.href = `${this.window.location.origin}${this.window.location.pathname}index.html`
    })
  }

}
