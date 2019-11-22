import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

class LanguageInfo {
  label:string
  languageCode:string
  languageDirection:string
}

@Injectable({
  providedIn: 'root'
})
export class LanguagesService {

  constructor(
    private http:HttpClient
  ) { }

  async list() {
    return <Array<LanguageInfo>>await this.http.get('./assets/translations.json').toPromise();
  }

  async getCurrentLanguage() {
    const languageCode = localStorage.getItem('languageCode')
    const language = (await this.list()).find(languageInfo => languageInfo.languageCode === languageCode)
    return language
  }

  async setLanguage(languageCode) {
    const language = (await this.list()).find(languageInfo => languageInfo.languageCode === languageCode)
    localStorage.setItem('languageCode', language.languageCode)
    localStorage.setItem('languageDirection', language.languageDirection)
  }

}
