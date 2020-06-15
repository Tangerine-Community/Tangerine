import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { ActivatedRoute } from '@angular/router';
import { _TRANSLATE } from '../../shared/_services/translation-marker';

@Component({
  selector: 'app-configure-group-security',
  templateUrl: './configure-group-security.component.html',
  styleUrls: ['./configure-group-security.component.css']
})
export class ConfigureGroupSecurityComponent implements OnInit {
  title = _TRANSLATE('Security');
  breadcrumbs;
  groupId;
  constructor(private route: ActivatedRoute) { }

  async ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Security'),
        url: `security`
      }
    ];

    this.route.params.subscribe(params => {
      this.groupId = params.groupId;
    });
  }

}
