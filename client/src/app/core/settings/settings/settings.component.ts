import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  @ViewChild('form', {static: false}) form: ElementRef;
  translations:any
  window:any
  languageCode = 'en'
  selected = ''
  constructor(
    private http: HttpClient
  ) {
    this.languageCode = localStorage.getItem('languageCode')
  }

  async ngOnInit() {
    this.selected = this.languageCode;
    this.translations = await this.http.get('./assets/translations.json').toPromise();
    this.form.nativeElement.querySelector('[type="submit"]').addEventListener('click', (event) => {
      event.preventDefault()
      const selectedLanguage = this.translations.find(languageInfo => languageInfo.languageCode === this.selected)
      localStorage.setItem('languageCode', selectedLanguage.languageCode)
      localStorage.setItem('languageDirection', selectedLanguage.languageDirection)
      alert(_TRANSLATE('Settings have been updated. You will now be redirected to log in.'))
      window.location.href = window.location.href.replace(window.location.hash, 'index.html')
    })
  }

}
