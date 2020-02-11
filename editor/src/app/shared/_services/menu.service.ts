import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  sidenavTitle = ''
  sectionTitle = ''
  section:string = ''
  groupId:string = ''

  constructor() { }

  setContext(sidenavTitle = '', sectionTitle = '', section = '', groupId = '') {
    this.sidenavTitle = sidenavTitle
    this.sectionTitle = sectionTitle
    this.section = section
    this.groupId = groupId
  }

}
