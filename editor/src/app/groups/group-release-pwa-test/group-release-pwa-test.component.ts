import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { ActivatedRoute } from '@angular/router';
import { ReleasePwaComponent } from './../release-pwa/release-pwa.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import moment from "moment";

@Component({
  selector: 'app-group-release-pwa-test',
  templateUrl: '../group-release-common/group-release.component.html',
  styleUrls: ['../group-release-common/group-release.component.css']
})
export class GroupReleasePwaTestComponent implements OnInit {

  title = _TRANSLATE('Release Test Web App')
  breadcrumbs:Array<Breadcrumb> = []
  submitted = false
  versionTag = ''
  releaseNotes = ''
  releaseType = "PWA"
  isPWA = true
  @ViewChild('releasePwaComponent', {static: false})releasePwaComponent:ReleasePwaComponent

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
    this.versionTag = moment().format('YYYY-MM-DD-HH-mm-ss')
  }
  submit() {
    if (this.versionTag === '') {
      this.versionTag = moment().format('YYYY-MM-DD-HH-mm-ss')
    }
    this.submitted = true
    this.releasePwaComponent.groupId = this.route.snapshot.paramMap.get('groupId')
    this.releasePwaComponent.releaseType = 'qa'
    this.releasePwaComponent.releaseNotes = this.releaseNotes
    this.releasePwaComponent.versionTag = this.versionTag
    this.releasePwaComponent.releasePWA()
  }
}
