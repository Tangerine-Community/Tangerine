import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model.js';
import { Component, OnInit, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { t } from 'tangy-form/util/t.js'
import {VariableService} from "../../../shared/_services/variable.service";
import {LanguagesService} from "../../../shared/_services/languages.service";
import {AppConfigService} from "../../../shared/_services/app-config.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements AfterContentInit {

  @ViewChild('container') container: ElementRef;
  translations:any
  window:any
  languageCode = 'en'
  usePouchDbLastSequenceTracking = false
  selected = ''
  syncCaseIfOnline = false
  
  constructor(
    private http: HttpClient,
    private variableService: VariableService,
    private languagesService:LanguagesService,
    private appConfigService:AppConfigService
  ) { }

  async ngAfterContentInit() {
    this.languageCode = await this.variableService.get('languageCode')
    this.usePouchDbLastSequenceTracking = await this.variableService.get('usePouchDbLastSequenceTracking')
    this.selected = this.languageCode;
    const translations = <Array<any>>await this.http.get('./assets/translations.json').toPromise();
    const appConfig = await this.appConfigService.getAppConfig()
    let syncCaseIfOnlineCheckbox;
    this.syncCaseIfOnline = await this.variableService.get('syncCaseIfOnline')
    if (appConfig.syncCaseIfOnline) {
      if (typeof this.syncCaseIfOnline === 'undefined') {
        this.syncCaseIfOnline = appConfig.syncCaseIfOnline
      }
      syncCaseIfOnlineCheckbox = `
          <tangy-checkbox
            value="${this.syncCaseIfOnline ? 'on' : ''}"
            name="syncCaseIfOnline"
            label="${t(` Sync case when opening a case.`)}"
          >
          </tangy-checkbox>
      `
    }
    this.container.nativeElement.innerHTML = `
      <tangy-form>
        <tangy-form-item>
          <h1>${t('Settings')}</h1>
          <tangy-select style="height: 130px" label="${t('Please choose your language: ')}" name="language" value="${this.languageCode}" required>
            ${translations.map(language => `
              <option value="${language.languageCode}">${t(language.label)}</option>
            `).join('')}
          </tangy-select>
          <tangy-checkbox
            value="${this.usePouchDbLastSequenceTracking ? 'on' : ''}"
            name="usePouchDbLastSequenceTracking"
            label="${t(` Use PouchDB's last sequence tracking when syncing.`)}"
          >
          </tangy-checkbox>
            ${syncCaseIfOnlineCheckbox}
          <p>
            ${t('After submitting updated settings, you will be required to log in again.')}
          </p>
        </tangy-form-item>
      </tangy-form>
    `
    this.container.nativeElement.querySelector('tangy-form').addEventListener('submit', async (event) => {
      event.preventDefault()
      const response = new TangyFormResponseModel(event.target.response)
      const selectedLanguageCode = response.inputsByName.language.value
      await this.languagesService.setLanguage(selectedLanguageCode, true)
      const usePouchDbLastSequenceTracking = response.inputsByName.usePouchDbLastSequenceTracking.value
        ? true
        : false
      await this.variableService.set('usePouchDbLastSequenceTracking', usePouchDbLastSequenceTracking)
      const syncCaseIfOnline = response.inputsByName.syncCaseIfOnline.value
        ? true
        : false
      await this.variableService.set('syncCaseIfOnline', syncCaseIfOnline)
      alert(t('Settings have been updated. You will now be redirected to log in.'))
      window.location.href = window.location.href.replace(window.location.hash, 'index.html')
    })
  }

}
