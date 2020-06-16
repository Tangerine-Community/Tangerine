import { Component, OnInit } from '@angular/core';
import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-manage-group-roles-permissions',
  templateUrl: './manage-group-roles-permissions.component.html',
  styleUrls: ['./manage-group-roles-permissions.component.css']
})
export class ManageGroupRolesPermissionsComponent implements OnInit {
  title = _TRANSLATE('Security');
  breadcrumbs;
  groupId;
  roles;
  constructor(private route: ActivatedRoute, private authenticationService: AuthenticationService) { }
  async ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Security'),
        url: `security`
      },
      <Breadcrumb>{
        label: _TRANSLATE('Configure Roles'),
        url: `security/configure-roles`
      }
    ];
    this.groupId = this.route.snapshot.paramMap.get('groupId');
    this.roles = await this.authenticationService.getAllRoles(this.groupId);
  }
}
