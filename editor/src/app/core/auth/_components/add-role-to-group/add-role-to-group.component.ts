import { Component, OnInit } from '@angular/core';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-add-role-to-group',
  templateUrl: './add-role-to-group.component.html',
  styleUrls: ['./add-role-to-group.component.css']
})
export class AddRoleToGroupComponent implements OnInit {
  title = _TRANSLATE('Security');
  breadcrumbs;
  groupId;
  constructor(private route: ActivatedRoute) { }
  async ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Security'),
        url: `security`
      },
      <Breadcrumb>{
        label: _TRANSLATE('Configure Roles'),
        url: `security/configure-roles`
      },
      <Breadcrumb>{
        label: _TRANSLATE('Add Roles to Group'),
        url: `security/configure-roles/add-role`
      }
    ];
    this.groupId = this.route.snapshot.paramMap.get('groupId');
  }
}
