import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../_services/authentication.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';

@Component({
  selector: 'app-manage-sitewide-permissions',
  templateUrl: './manage-sitewide-permissions.component.html',
  styleUrls: ['./manage-sitewide-permissions.component.css']
})
export class ManageSitewidePermissionsComponent implements OnInit {
  username;
  permissionsList;
  userPermissions;
  constructor(private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private permissionsService: NgxPermissionsService,
    private errorHandler: TangyErrorHandler
  ) { }

  async ngOnInit() {
    this.username = this.username = this.route.snapshot.paramMap.get('username')
    const permissions = await this.authenticationService.getPermissionsList()
    this.permissionsList = permissions['sitewidePermissions'];
    this.userPermissions = await this.authenticationService.getUserPermissions(this.username)
  }
  doesUserHavePermission(permission) {
    return this.userPermissions.sitewidePermissions.indexOf(permission) >= 0
  }
  onSelectChange(permission, value) {
    if (value) {
      this.userPermissions.sitewidePermissions = [...new Set([...this.userPermissions.sitewidePermissions, permission])];
    } else {
      this.userPermissions.sitewidePermissions = this.userPermissions.sitewidePermissions.filter(perm => perm !== permission)
    }
  }

  async submit() {
    try {
      const data = await this.authenticationService.updateUserPermissions(this.username, this.userPermissions.sitewidePermissions);
      this.errorHandler.handleError(_TRANSLATE('Permissions Updated Successfully. User will need to log out and log back in to receive updated permissions.'));
    } catch (error) {
      console.error(error);
    }
  }
}
