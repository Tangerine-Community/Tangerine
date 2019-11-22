import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

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
    private http:HttpClient
  ) { }

  async install() {
    const language = (await this.list())[0]
    localStorage.setItem(LANGUAGE_CODE, language.languageCode)
    localStorage.setItem(LANGUAGE_DIRECTION, language.languageDirection)
    localStorage.setItem(USER_HAS_SET_LANGUAGE, 'false')
  }

  uninstall() {
    localStorage.removeItem(LANGUAGE_CODE)
    localStorage.removeItem(LANGUAGE_DIRECTION)
    localStorage.removeItem(USER_HAS_SET_LANGUAGE)
  }

  async list() {
    return <Array<LanguageInfo>>await this.http.get('./assets/translations.json').toPromise();
  }

  async getCurrentLanguage() {
    const languageCode = localStorage.getItem(LANGUAGE_CODE)
    const language = (await this.list()).find(languageInfo => languageInfo.languageCode === languageCode)
    return language
  }

  async setLanguage(languageCode, userHasSetLanguage = false) {
    const language = (await this.list()).find(languageInfo => languageInfo.languageCode === languageCode)
    localStorage.setItem(LANGUAGE_CODE, language.languageCode)
    localStorage.setItem(LANGUAGE_DIRECTION, language.languageDirection)
    localStorage.setItem(USER_HAS_SET_LANGUAGE, userHasSetLanguage ? 'true' : 'false')
  }

  userHasSetLanguage() {
    localStorage.getItem(USER_HAS_SET_LANGUAGE) === 'true' ? true : false
  }

}
