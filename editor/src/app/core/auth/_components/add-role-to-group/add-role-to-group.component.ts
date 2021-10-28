import { Component, OnInit } from '@angular/core';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { AuthenticationService } from '../../_services/authentication.service';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { ProcessMonitorService } from 'src/app/shared/_services/process-monitor.service';

@Component({
  selector: 'app-add-role-to-group',
  templateUrl: './add-role-to-group.component.html',
  styleUrls: ['./add-role-to-group.component.css']
})
export class AddRoleToGroupComponent implements OnInit {
  title = _TRANSLATE('Security');
  breadcrumbs;
  groupId;
  newRole;
  roleExists = null;
  permissionsList;
  groupPermissions = [];
  constructor(private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private router: Router,
    private processMonitorService:ProcessMonitorService,
    private errorHandler: TangyErrorHandler) { }
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
        label: _TRANSLATE('Add Role to Group'),
        url: `security/configure-roles/add-role`
      }
    ];
    this.groupId = this.route.snapshot.paramMap.get('groupId');
    const permissions = await this.authenticationService.getPermissionsList();
    this.permissionsList = permissions['groupPermissions'].sort();
  }

  async doesRoleExistOnGroup(roleName: string) {
    const data = await this.authenticationService.findRoleByName(this.groupId, roleName);
    this.roleExists = Object.entries(data).length > 0;
  }

  onSelectChange(permission, value) {
    if (value) {
      this.groupPermissions = [...new Set([...this.groupPermissions, permission])];
    } else {
      this.groupPermissions = this.groupPermissions.filter(perm => perm !== permission);
    }
  }
  async submit() {
    const process = this.processMonitorService.start('addRoleSaving', 'Saving role...')
    const data = { role: this.newRole, permissions: this.groupPermissions };
    await this.authenticationService.addNewRoleToGroup(this.groupId, data);
    this.errorHandler.handleError('Role Added to Group Successfully');
    this.router.navigate([`groups/${this.groupId}/configure/security`]);
    this.processMonitorService.stop(process.id)
  }
}
