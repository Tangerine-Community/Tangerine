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
 
  @ViewChild('releasePwaComponent', {static: true})releasePwaComponent:ReleasePwaComponent
  submitted = false
  versionTag = ''
  releaseNotes = ''

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
  }
  submit() {
    this.submitted = true
    this.releasePwaComponent.groupId = this.route.snapshot.paramMap.get('groupId')
    this.releasePwaComponent.releaseType = 'qa'
    this.releasePwaComponent.releaseNotes = this.releaseNotes
    this.releasePwaComponent.versionTag = this.versionTag
    this.releasePwaComponent.releasePWA()
  }
}
