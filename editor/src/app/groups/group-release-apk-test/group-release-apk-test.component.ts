import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { ActivatedRoute } from '@angular/router';
import { ReleaseApkComponent } from './../release-apk/release-apk.component';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-group-release-apk-test',
  templateUrl: './group-release-apk-test.component.html',
  styleUrls: ['./group-release-apk-test.component.css']
})
export class GroupReleaseApkTestComponent implements OnInit {

  title = _TRANSLATE('Release Test Android App')
  breadcrumbs:Array<Breadcrumb> = []
 
  @ViewChild('releaseApkComponent') releaseApkComponent:ReleaseApkComponent
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
        label: _TRANSLATE('Release Test Android App'),
        url: 'releases/release-apk-test'
      }
    ]
    this.route.params.subscribe(async params => {
      this.releaseApkComponent.groupId = params.groupId
      this.releaseApkComponent.releaseType = 'qa' 
      this.releaseApkComponent.releaseAPK()
    })
  }

}
