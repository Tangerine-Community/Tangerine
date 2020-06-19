import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from '../../shared/_services/translation-marker';

@Component({
  selector: 'app-configure-group-security',
  templateUrl: './configure-group-security.component.html',
  styleUrls: ['./configure-group-security.component.css']
})
export class ConfigureGroupSecurityComponent implements OnInit {
  title = _TRANSLATE('Security');
  breadcrumbs;
  constructor() { }
    async ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Security'),
        url: `security`
      }
    ];
  }

}
