import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {VariableService} from "./variable.service";

class LanguageInfo {
  label:string
  languageCode:string
  languageDirection:string
}

const LANGUAGE_CODE = 'languageCode' // This is used to load the translation files by name like 'en_us.json'
const LANGUAGE_LOCALE = 'languageLocale' // This is the properly formatted locale like 'en-US'
const LANGUAGE_DIRECTION = 'languageDirection'
const USER_HAS_SET_LANGUAGE = 'userHasSetLanguage'

@Injectable({
  providedIn: 'root'
})
export class LanguagesService {

  constructor(
    private http:HttpClient,
    private variableService: VariableService
  ) { }

  async install() {
    const language = (await this.list())[0]
    await this.variableService.set(LANGUAGE_CODE, language.languageCode)
    await this.variableService.set(LANGUAGE_LOCALE, language.languageCode.replace('_', '-'));
    await this.variableService.set(LANGUAGE_DIRECTION, language.languageDirection)
    await this.variableService.set(USER_HAS_SET_LANGUAGE, 'false')
  }

  async uninstall() {
    await this.variableService.set(LANGUAGE_CODE, null)
    await this.variableService.set(LANGUAGE_LOCALE, null)
    await this.variableService.set(LANGUAGE_DIRECTION, null)
    await this.variableService.set(USER_HAS_SET_LANGUAGE, null)
  }

  async list() {
    return <Array<LanguageInfo>>await this.http.get('./assets/translations.json').toPromise();
  }

  // Use this to get the current language code for loading translation files
  async getCurrentLanguage() {
    const languageCode = await this.variableService.get(LANGUAGE_CODE)
    const language = (await this.list()).find(languageInfo => languageInfo.languageCode === languageCode)
    return language
  }

  // Use this to get the current language locale for formatting dates and numbers
  async getCurrentLanguageLocale() {
    return await this.variableService.get(LANGUAGE_LOCALE);
  }

  async setLanguage(languageCode, userHasSetLanguage = false) {
    const language = (await this.list()).find(languageInfo => languageInfo.languageCode === languageCode)
    await this.variableService.set(LANGUAGE_CODE, language.languageCode)
    await this.variableService.set(LANGUAGE_DIRECTION, language.languageDirection)
    await this.variableService.set(USER_HAS_SET_LANGUAGE, userHasSetLanguage ? 'true' : 'false')
  }

  async userHasSetLanguage(): Promise<boolean> {
    const userSetLanguage = await this.variableService.get(USER_HAS_SET_LANGUAGE)
    return userSetLanguage === 'true' ? true : false
  }

}
