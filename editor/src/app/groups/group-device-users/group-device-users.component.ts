import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-group-device-users',
  templateUrl: './group-device-users.component.html',
  styleUrls: ['./group-device-users.component.css']
})
export class GroupDeviceUsersComponent implements OnInit {
  
  title = _TRANSLATE('Device Users')
  breadcrumbs:Array<Breadcrumb> = []
 
  groupId:string

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: 'Device Users',
        url: 'device-users'
      }
    ]
    this.route.params.subscribe(async params => {
      this.groupId = params.groupId
    })
  }

}
