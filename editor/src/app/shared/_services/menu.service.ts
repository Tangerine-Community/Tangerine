import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  title = ''
  groupId:string = ''
  section:string = ''

  constructor() { }

  setContext(title = '', groupId = '', section = '',) {
    this.title = title 
    this.section = section
    this.groupId = groupId
  }

}
