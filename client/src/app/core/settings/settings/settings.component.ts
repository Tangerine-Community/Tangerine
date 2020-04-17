import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model.js';
import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { Component, OnInit, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements AfterContentInit {

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

  async ngAfterContentInit() {
    this.selected = this.languageCode;
    const translations = <Array<any>>await this.http.get('./assets/translations.json').toPromise();
    this.container.nativeElement.innerHTML = `
      <tangy-form>
        <tangy-form-item>
          <h1>${_TRANSLATE('Settings')}</h1>
          <tangy-select style="height: 130px" label="${_TRANSLATE('Please choose your language: ')}" name="language" value="${this.languageCode}" required>
            ${translations.map(language => `
              <option value="${language.languageCode}">${language.label}</option>
            `).join('')}
          </tangy-select>
          <p>
            ${_TRANSLATE('After submitting updated settings, you will be required to log in again.')}
          </p>
        </tangy-form-item>
      </tangy-form>
    `
    this.container.nativeElement.querySelector('tangy-form').addEventListener('submit', (event) => {
      event.preventDefault()
      const response = new TangyFormResponseModel(event.target.response) 
      const selectedLanguageCode = response.inputsByName.language.value
      const selectedLanguage = translations.find(language => language.languageCode === selectedLanguageCode)
      localStorage.setItem('languageCode', selectedLanguage.languageCode)
      localStorage.setItem('languageDirection', selectedLanguage.languageDirection)
      alert(_TRANSLATE('Settings have been updated. You will now be redirected to log in.'))
      window.location.href = window.location.href.replace(window.location.hash, 'index.html')
    })
  }

}
