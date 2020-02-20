import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-group-device-user',
  templateUrl: './group-device-user.component.html',
  styleUrls: ['./group-device-user.component.css']
})
export class GroupDeviceUserComponent implements OnInit {

  title = _TRANSLATE('Device User')
  breadcrumbs:Array<Breadcrumb> = []
 
  constructor(
    private route:ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.breadcrumbs = [
        <Breadcrumb>{
          label: _TRANSLATE('Device Users'),
          url: 'device-users'
        },
        <Breadcrumb>{
          label: this.title,
          url: `device-users/${params.responseId}` 
        }
      ]
    })
  }

}
