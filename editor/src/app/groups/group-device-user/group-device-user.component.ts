import { TangyFormsPlayerComponent } from './../../tangy-forms/tangy-forms-player/tangy-forms-player.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-group-device-user',
  templateUrl: './group-device-user.component.html',
  styleUrls: ['./group-device-user.component.css']
})
export class GroupDeviceUserComponent implements OnInit {

  title = _TRANSLATE('Device User')
  breadcrumbs:Array<Breadcrumb> = []
  @ViewChild('formPlayer', {static: true}) formPlayer: TangyFormsPlayerComponent
  
  responseId:string

  constructor(
    private route:ActivatedRoute,
    private router:Router
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.responseId = params.responseId || ''
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
      this.ready();
    })
  }

  async ready() {
    this.formPlayer.formResponseId = this.responseId
    this.formPlayer.formId = 'user-profile'
    this.formPlayer.preventSubmit = true
    await this.formPlayer.render()
    this.formPlayer.$submit.subscribe(async () => {
      this.router.navigate([`../`], { relativeTo: this.route })
    })
  }

}
