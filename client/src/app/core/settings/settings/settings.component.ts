import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model.js';
import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  @ViewChild('container', {static: false}) container: ElementRef;
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
    const translations = <Array<any>>await this.http.get('./assets/translations.json').toPromise();
    this.container.nativeElement.innerHTML = `
      <tangy-form>
        <tangy-form-item>
          <h1>Settings</h1>
          <tangy-radio-buttons label="${_TRANSLATE('Please choose your language: ')}" name="language" required>
            ${translations.map(language => `
              <option value="${language.languageCode}">${language.label}</option>
            `).join('')}
          </tangy-radio-buttons>
          <p>
            ${_TRANSLATE('After submitting updated settings, you will be required to log in again.')}
          </p>
        </tangy-form-item>
      </tangy-form>
    `
    this.container.nativeElement.querySelector('tangy-form').addEventListener('submit', (event) => {
      event.preventDefault()
      const response = new TangyFormResponseModel(event.target.response) 
      const selectedLanguageCode = response.inputsByName.language.value.find(option => option.value === 'on').name
      const selectedLanguage = translations.find(language => language.languageCode === selectedLanguageCode)
      localStorage.setItem('languageCode', selectedLanguage.languageCode)
      localStorage.setItem('languageDirection', selectedLanguage.languageDirection)
      alert(_TRANSLATE('Settings have been updated. You will now be redirected to log in.'))
      window.location.href = window.location.href.replace(window.location.hash, 'index.html')
    })
  }

}
