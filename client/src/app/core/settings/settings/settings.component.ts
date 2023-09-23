import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model.js';
import { Component, OnInit, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { t } from 'tangy-form/util/t.js'
import {VariableService} from "../../../shared/_services/variable.service";
import {LanguagesService} from "../../../shared/_services/languages.service";
import {AppConfigService} from "../../../shared/_services/app-config.service";
import {DashboardService} from "../../../class/_services/dashboard.service";
import {TangyFormsInfoService} from "../../../tangy-forms/tangy-forms-info-service";
import {ClassFormService} from "../../../class/_services/class-form.service";
import {_TRANSLATE} from "../../../shared/translation-marker";
import {TangyFormResponse} from "../../../tangy-forms/tangy-form-response.class";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, AfterContentInit {

  @ViewChild('container') container: ElementRef;
  translations:any
  window:any
  languageCode = 'en'
  usePouchDbLastSequenceTracking = false
  selected = ''
  classes: any;
  showClassConfig = false;
  constructor(
    private http: HttpClient,
    private variableService: VariableService,
    private languagesService:LanguagesService,
    private appConfigService:AppConfigService,
    private dashboardService: DashboardService,
    private tangyFormsInfoService: TangyFormsInfoService,
    private classFormService: ClassFormService,
  ) { }

  async ngOnInit(): Promise<void> {
    const appConfig = await this.appConfigService.getAppConfig()
    if (appConfig.homeUrl === 'dashboard') {
      this.showClassConfig = true;
      await this.classFormService.initialize();
      this.classes = await this.dashboardService.getMyClasses();
      console.log("Got classes")
    }
  }

  async ngAfterContentInit() {
    this.languageCode = await this.variableService.get('languageCode')
    this.usePouchDbLastSequenceTracking = await this.variableService.get('usePouchDbLastSequenceTracking')
    this.selected = this.languageCode;
    const translations = <Array<any>>await this.http.get('./assets/translations.json').toPromise();
    const appConfig = await this.appConfigService.getAppConfig()
    let classDashboardOption = ''
    if (appConfig.homeUrl === 'dashboard') {
      // classDashboardOption = `
      // <div class="class-config-content">
      //   <h1>Class Configuration</h1>
      //   <p>Toggle a class 'off' to archive. The toggle will be white when 'off'. Click a class 'on' to enable.  The toggle will be orange when 'on'. </p>
      //   <span *ngFor="let class of classes; let classIndex=index">
      //     <p>
      //       <mat-slide-toggle [checked]="!class.doc.archive"
      //                         (click)="toggleClass(class.id)">Class: ${getClassTitle(class.doc)}</mat-slide-toggle>
      //     </p>
      //   </span>
      // </div>`
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
            label="${t(`Use PouchDB's last sequence tracking when syncing.`)}"
          >
          </tangy-checkbox>

          <p>
            ${t('After submitting updated settings, you will be required to log in again.')}
          </p>
        </tangy-form-item>
      </tangy-form>
        ${classDashboardOption}`
    this.container.nativeElement.querySelector('tangy-form').addEventListener('submit', async (event) => {
      event.preventDefault()
      const response = new TangyFormResponseModel(event.target.response)
      const selectedLanguageCode = response.inputsByName.language.value
      await this.languagesService.setLanguage(selectedLanguageCode, true)
      const usePouchDbLastSequenceTracking = response.inputsByName.usePouchDbLastSequenceTracking.value
        ? true
        : false
      await this.variableService.set('usePouchDbLastSequenceTracking', usePouchDbLastSequenceTracking)
      alert(t('Settings have been updated. You will now be redirected to log in.'))
      window.location.href = window.location.href.replace(window.location.hash, 'index.html')
    })
  }

  async toggleClass(id) {
    try {
      const doc = await this.classFormService.getResponse(id)
      const archived = doc.archive
      if (archived) {
        await this.dashboardService.enableDoc(id)
      } else {
        await this.dashboardService.archiveDoc(id)
      }
    } catch (error) {
      console.log(_TRANSLATE('Could not Toggle Form. Error: ' + error));
    }
    await this.variableService.set('class-classIndex', null);
    await this.variableService.set('class-currentClassId', null);
    await this.variableService.set('class-curriculumId', null);
    await this.variableService.set('class-currentItemId', null);
  }

  getClassTitle(classResponse:TangyFormResponse) {
    const gradeInput = classResponse.items[0].inputs.find(input => input.name === 'grade')
    return gradeInput.value
  }

}
