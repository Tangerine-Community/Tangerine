import { Injectable } from '@angular/core';

export const MENU_MODE_GROUP = 'MENU_MODE_GROUP'
export const MENU_MODE_TITLE = 'MENU_MODE_TITLE'

export interface GroupInfo {
  id:string,
  name:string,
  section:string
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  mode:string
  groupInfo:GroupInfo
  menuTitle:string

  constructor() { }

  setTitleMode(title:string) {
    this.mode = MENU_MODE_TITLE
    this.menuTitle = title
  }

  setGroupMode(groupId:string, groupName:string, section:string) {
    this.mode = MENU_MODE_GROUP
    this.groupInfo = <GroupInfo>{
      id: groupId,
      name: groupName,
      section
    }
  }

}
