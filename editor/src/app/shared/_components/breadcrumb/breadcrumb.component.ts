import { MenuService } from './../../_services/menu.service';
import { GroupsService } from './../../../groups/services/groups.service';
import { Component, OnInit, Input } from '@angular/core';

export interface Breadcrumb {
  url:string
  label:string
}

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent {

  @Input() set breadcrumbs(crumbs:Array<Breadcrumb>) {
    this.bakeCrumbs(crumbs)
  }
  bakedCrumbs:Array<Breadcrumb> = []

  @Input() title = ''

  constructor(
    private groupsService:GroupsService,
    private menuService:MenuService
  ) { }

  async bakeCrumbs(crumbs) {
    const params = window.location.hash.split('/')
    const bakedCrumbs = []
    let contextUrl = ''
    // Group context.
    if (params[1] === 'groups') {
      const group = await this.groupsService.getGroupInfo(params[2])
      contextUrl = `#/groups/${params[2]}`
      bakedCrumbs.push(<Breadcrumb>{
        label: group.label,
        url: contextUrl 
      })
    }
    // Group Section.
    if (params[1] === 'groups' && params[3]) {
      contextUrl = `${contextUrl}/${params[3]}`
      bakedCrumbs.push(<Breadcrumb>{
        label: params[3].charAt(0).toUpperCase() + params[3].slice(1),
        url: contextUrl
      })
    }
    this.bakedCrumbs = [
      ...bakedCrumbs,
      ...crumbs.map(crumb => {
        return {
          ...crumb,
          url: contextUrl ? `${contextUrl}/${crumb.url}` : crumb.url
        }
      })
    ]
    // Update menu.
    if (params[1] === 'groups' && !params[3]) {
      const group = await this.groupsService.getGroupInfo(params[2])
      this.menuService.setContext(group.label, group._id, '')
    } else if (params[1] === 'groups' && params[3]) {
      const group = await this.groupsService.getGroupInfo(params[2])
      this.menuService.setContext(group.label, group._id, params[3])
    }
  }

}
