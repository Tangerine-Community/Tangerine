import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { ActivatedRoute } from '@angular/router';
import { ReleaseApkComponent } from './../release-apk/release-apk.component';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-group-release-apk-live',
  templateUrl: './group-release-apk-live.component.html',
  styleUrls: ['./group-release-apk-live.component.css']
})
export class GroupReleaseApkLiveComponent implements OnInit {

  title = _TRANSLATE('Release Live Android App')
  breadcrumbs:Array<Breadcrumb> = []
  submitted = false
  releaseNotes=''
  versionTag=''
  @ViewChild('releaseApkComponent', {static: true}) releaseApkComponent:ReleaseApkComponent

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
        label: _TRANSLATE('Release Live Android App'),
        url: 'releases/release-apk-live'
      }
    ]
  }

  submit() {
    this.submitted = true
    this.releaseApkComponent.groupId = this.route.snapshot.paramMap.get('groupId')
    this.releaseApkComponent.releaseType = 'prod'
    this.releaseApkComponent.releaseNotes = this.releaseNotes
    this.releaseApkComponent.versionTag = this.versionTag
    this.releaseApkComponent.releaseAPK()
  }
}
