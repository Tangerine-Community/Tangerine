import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-group-releases',
  templateUrl: './group-releases.component.html',
  styleUrls: ['./group-releases.component.css']
})
export class GroupReleasesComponent implements OnInit {

  title = _TRANSLATE('Releases')
  breadcrumbs:Array<Breadcrumb> = []
 
  @Input() groupId:string

  constructor() { }

  ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Releases'),
        url: 'releases'
      }
    ]
  }

}
