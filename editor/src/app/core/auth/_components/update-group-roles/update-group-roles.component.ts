import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../_services/authentication.service';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';

@Component({
  selector: 'app-update-group-roles',
  templateUrl: './update-group-roles.component.html',
  styleUrls: ['./update-group-roles.component.css']
})
export class UpdateGroupRolesComponent implements OnInit {
  breadcrumbs;
  permissionsList;
  role;
  roleName;
  groupId;
  title = _TRANSLATE('Update Role:');
  constructor(private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private router: Router,
    private errorHandler: TangyErrorHandler) { }

  async ngOnInit() {
    this.roleName = this.route.snapshot.paramMap.get('roleName');
    this.groupId = this.route.snapshot.paramMap.get('groupId');
    this.role = await this.authenticationService.findRoleByName(this.groupId, this.roleName);
    this.title = `${_TRANSLATE('Update Role:')} ${this.role.role}`
    const permissions = await this.authenticationService.getPermissionsList();
    this.permissionsList = permissions['groupPermissions'].sort();
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Security'),
        url: `security`
      },
      <Breadcrumb>{
        label: this.title,
        url: `security/update-role/${this.roleName}`
      }
    ];

  }

  doesRoleHavePermission(permission) {
    return this.role.permissions.indexOf(permission) >= 0;
  }
  onSelectChange(permission, value) {
    if (value) {
      this.role.permissions = [...new Set([...this.role.permissions, permission])];
    } else {
      this.role.permissions = this.role.permissions.filter(perm => perm !== permission);
    }
  }
  async submit() {
    this.authenticationService.updateRoleInGroup(this.groupId, this.role);
    this.errorHandler.handleError('Role Updated Successfully');
    this.router.navigate([`groups/${this.groupId}/configure/security`]);
  }
}
