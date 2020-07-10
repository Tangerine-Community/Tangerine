import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {DeviceService} from "../../device/services/device.service";
import {VariableService} from "./variable.service";

class LanguageInfo {
  label:string
  languageCode:string
  languageDirection:string
}

const LANGUAGE_CODE = 'languageCode'
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
    await this.variableService.set(LANGUAGE_DIRECTION, language.languageDirection)
    await this.variableService.set(USER_HAS_SET_LANGUAGE, 'false')
  }

  async uninstall() {
    await this.variableService.set(LANGUAGE_CODE, null)
    await this.variableService.set(LANGUAGE_DIRECTION, null)
    await this.variableService.set(USER_HAS_SET_LANGUAGE, null)
  }

  async list() {
    return <Array<LanguageInfo>>await this.http.get('./assets/translations.json').toPromise();
  }

  async getCurrentLanguage() {
    const languageCode = await this.variableService.get(LANGUAGE_CODE)
    const language = (await this.list()).find(languageInfo => languageInfo.languageCode === languageCode)
    return language
  }

  async setLanguage(languageCode, userHasSetLanguage = false) {
    const language = (await this.list()).find(languageInfo => languageInfo.languageCode === languageCode)
    await this.variableService.set(LANGUAGE_CODE, language.languageCode)
    await this.variableService.set(LANGUAGE_DIRECTION, language.languageDirection)
    await this.variableService.set(USER_HAS_SET_LANGUAGE, userHasSetLanguage ? 'true' : 'false')
  }

  async userHasSetLanguage(): Promise<boolean> {
    return await this.variableService.get(USER_HAS_SET_LANGUAGE) === 'true' ? true : false
  }

}
