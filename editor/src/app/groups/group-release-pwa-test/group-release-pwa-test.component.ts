import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { ActivatedRoute } from '@angular/router';
import { ReleasePwaComponent } from './../release-pwa/release-pwa.component';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-group-release-pwa-test',
  templateUrl: './group-release-pwa-test.component.html',
  styleUrls: ['./group-release-pwa-test.component.css']
})
export class GroupReleasePwaTestComponent implements OnInit {

  title = _TRANSLATE('Release Test Web App')
  breadcrumbs:Array<Breadcrumb> = []
 
  @ViewChild('releasePwaComponent')releasePwaComponent:ReleasePwaComponent
  groupId:string

  constructor(
    private route:ActivatedRoute
  ) { }

  ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Releases'),
        url: 'releases'
      },
      <Breadcrumb>{
        label: _TRANSLATE('Release Test Web App'),
        url: 'releases/release-pwa-test'
      }
    ]
    this.route.params.subscribe(async params => {
      this.releasePwaComponent.groupId = params.groupId
      this.releasePwaComponent.releaseType = 'qa' 
      this.releasePwaComponent.releasePWA()
    })
  }

}
