import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-group-configure',
  templateUrl: './group-configure.component.html',
  styleUrls: ['./group-configure.component.css']
})
export class GroupConfigureComponent implements OnInit {

  title = _TRANSLATE('Configure')
  breadcrumbs:Array<Breadcrumb> = []

  constructor(
  ) { }

  async ngOnInit() {
    this.breadcrumbs = []
  }

}
