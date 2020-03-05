import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-group-location-list',
  templateUrl: './group-location-list.component.html',
  styleUrls: ['./group-location-list.component.css']
})
export class GroupLocationListComponent implements OnInit {

  title = _TRANSLATE("Location List")
  breadcrumbs:Array<Breadcrumb> = []

  constructor() { }

  ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Location List'),
        url: `location-list`
      }
    ]
  }

}
