import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-group-deploy',
  templateUrl: './group-deploy.component.html',
  styleUrls: ['./group-deploy.component.css']
})
export class GroupDeployComponent implements OnInit {

  title = _TRANSLATE('Deploy')
  breadcrumbs:Array<Breadcrumb> = []

  constructor(
  ) { }

  async ngOnInit() {
    this.breadcrumbs = []
  }

}
