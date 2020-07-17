import { AppConfigService } from './../../../shared/_services/app-config.service';
import { Subject } from 'rxjs';
import { LanguagesService } from './../../../shared/_services/languages.service';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-device-language',
  templateUrl: './device-language.component.html',
  styleUrls: ['./device-language.component.css']
})
export class DeviceLanguageComponent implements OnInit {

  testing = false
  done$ = new Subject()
  showRestoreButton = true

  @ViewChild('container', {static: true}) container:ElementRef
  constructor(
    private languagesService:LanguagesService,
    private appConfigService:AppConfigService
  ) { }

  async ngOnInit() {
    const appConfig = await this.appConfigService.getAppConfig()
    const languages = await this.languagesService.list()
    this.container.nativeElement.innerHTML = `
      <tangy-form id="language-select">
        <tangy-form-item id="language-select">
          <div style="text-align: center">
            <img style="width: 30%; margin: auto" id="logo" src='./logo.png'/><br>
            <h2>Welcome to the ${appConfig.groupName} group on the ${appConfig.serverUrl} server. Let's get started by setting up your language.</h2>
          </div>
          <tangy-select name="language-select" required>
            ${languages.map(language => `
              <option value="${language.languageCode}">${language.label}</option>
            `).join('')}
          <tangy-select>
        </tangy-form-item>
      </tangy-form>
    `
    const languageSelectFormEl = this.container
      .nativeElement
      .querySelector('tangy-form')
    languageSelectFormEl
      .addEventListener('submit', async (event) => {
        this.showRestoreButton = false
        const languageCode = event.target.getValue('language-select')
        await this.languagesService.setLanguage(languageCode, true)
        this.done$.next(true)

      })
    languageSelectFormEl.newResponse()
  }

}
