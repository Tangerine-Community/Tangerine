import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-group-author',
  templateUrl: './group-author.component.html',
  styleUrls: ['./group-author.component.css']
})
export class GroupAuthorComponent implements OnInit {

  title = _TRANSLATE('Author')
  breadcrumbs:Array<Breadcrumb> = []

  constructor(
  ) { }

  async ngOnInit() {
    this.breadcrumbs = []
  }

 }
