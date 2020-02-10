import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  section:string = ''
  groupId:string = ''
  title:string = ''

  constructor() { }

  setContext(title, section = '', groupId = '') {
    this.section = section
    this.groupId = groupId
    this.title = title
  }

}
