import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AppConfig } from 'src/app/shared/_classes/app-config.class';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { ProcessMonitorService } from 'src/app/shared/_services/process-monitor.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';

const strongPasswordPolicyDescription = 'Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters'
const strongPasswordPolicyRegEx = "(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
const strongPasswordPolicyRegExEscaped = "(?=.*\\\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
//const strongPasswordPolicyRegEx = "foo"

@Component({
  selector: 'app-group-device-password-policy',
  templateUrl: './group-device-password-policy.component.html',
  styleUrls: ['./group-device-password-policy.component.css']
})
export class GroupDevicePasswordPolicyComponent implements OnInit {

  @ViewChild('passwordPolicyCategoryEl', {static: true}) passwordPolicyCategoryEl:ElementRef
  @ViewChild('passwordPolicyRegexEl', {static: false}) passwordPolicyRegexEl:ElementRef
  @ViewChild('passwordPolicyDescriptionEl', {static: false}) passwordPolicyDescriptionEl:ElementRef
  @ViewChild('accountRecoveryQuestionEl', {static: false}) accountRecoveryQuestionEl:ElementRef

  title = _TRANSLATE("Device Accounts Configuration")
  breadcrumbs:Array<Breadcrumb> = []

  passwordPolicyCategory:string
  passwordPolicyRegex:string
  passwordPolicyDescription:string
  accountRecoveryQuestion:string

  constructor(
    private processMonitor: ProcessMonitorService,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    const process = this.processMonitor.start('group-device-password-policy', 'Retrieving group device password policy...')
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Device Accounts Configuration'),
        url: `sync`
      }
    ]
    const appConfig = <AppConfig>await this.http.get('./assets/app-config.json').toPromise()
    this.passwordPolicyRegex = appConfig.passwordPolicy?.replace
      ? appConfig.passwordPolicy.replace(/\\/g, '\\\\')
      : ''
    this.passwordPolicyDescription = appConfig.passwordRecipe
    this.accountRecoveryQuestion = appConfig.securityQuestionText
    if (appConfig.passwordPolicy === strongPasswordPolicyRegEx) {
      this.passwordPolicyCategory = 'strong_password_policy'
    }
    if (appConfig.passwordPolicy === '' || appConfig.passwordPolicy === undefined) {
      this.passwordPolicyCategory = 'no_password_policy'
    }  
    if (appConfig.noPassword) {
      this.passwordPolicyCategory = 'no_password'
    }
    this.passwordPolicyCategoryEl.nativeElement.value = this.passwordPolicyCategoryEl.nativeElement.value.map(option => {
      if (option.name === this.passwordPolicyCategory) {
        option.value = 'on' 
      }
      return option
    })
    this.processMonitor.stop(process.id)
  }

  onPasswordPolicyCategorySelect() {
    this.passwordPolicyCategory = this.passwordPolicyCategoryEl.nativeElement.value.find(option => option.value).name
    this.passwordPolicyDescription = this.passwordPolicyCategory === 'strong_password_policy'
      ? strongPasswordPolicyDescription
      : ''
    this.passwordPolicyRegex = this.passwordPolicyCategory === 'strong_password_policy'
      ? strongPasswordPolicyRegExEscaped
      : ''
  }

  async submit() {
    const process = this.processMonitor.start('group-device-password-policy', 'Saving...')
    const appConfig = <AppConfig>await this.http.get('./assets/app-config.json').toPromise()
    if (this.passwordPolicyCategory === 'no_password') {
      appConfig.noPassword = true
      appConfig.passwordPolicy = ''
      appConfig.passwordRecipe = ''
      appConfig.securityQuestionText = ''
    } else if (this.passwordPolicyCategory === 'no_password_policy') {
      appConfig.noPassword = false
      appConfig.passwordPolicy = '' 
      appConfig.securityQuestionText = this.accountRecoveryQuestionEl?.nativeElement?.value
      appConfig.passwordRecipe = this.passwordPolicyDescriptionEl?.nativeElement?.value
    } else {
      appConfig.noPassword = false
      appConfig.passwordPolicy = this.passwordPolicyRegexEl?.nativeElement?.value.replace(/\\\\/g, '\\')
      appConfig.securityQuestionText = this.accountRecoveryQuestionEl?.nativeElement?.value
      appConfig.passwordRecipe = this.passwordPolicyDescriptionEl?.nativeElement?.value
    }
    await this.http.post('/editor/file/save', {
      groupId: window.location.pathname.split('/')[2],
      filePath: './app-config.json',
      fileContents: JSON.stringify(appConfig, null, 2)
    }).toPromise()
    this.processMonitor.stop(process.id)
  }

}
