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

  sleep = (milliseconds) => new Promise((res) => setTimeout(() => {res(true)}, milliseconds))

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
    // console.log("setLanguage")
    const language = (await this.list()).find(languageInfo => languageInfo.languageCode === languageCode)
    // console.log("Setting LANGUAGE_CODE")
    await this.variableService.set(LANGUAGE_CODE, language.languageCode)
    // await this.sleep(2000)
    // console.log("Setting LANGUAGE_DIRECTION")
    await this.variableService.set(LANGUAGE_DIRECTION, language.languageDirection)
    // await this.sleep(2000)
    // console.log("Setting USER_HAS_SET_LANGUAGE")
    await this.variableService.set(USER_HAS_SET_LANGUAGE, userHasSetLanguage ? 'true' : 'false')
    // await this.sleep(2000)
    // console.log("Just set USER_HAS_SET_LANGUAGE, now setting our friend koko.")
    // await this.variableService.set('koko', 'poco')
  }

  async userHasSetLanguage(): Promise<boolean> {
    const userSetLanguage = await this.variableService.get(USER_HAS_SET_LANGUAGE)
    console.log("userSetLanguage: " + userSetLanguage)
    return userSetLanguage === 'true' ? true : false
  }

}
