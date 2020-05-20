import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { AuthenticationService } from 'src/app/core/auth/_services/authentication.service';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'app-assign-permissions',
  templateUrl: './assign-permissions.component.html',
  styleUrls: ['./assign-permissions.component.css']
})
export class AssignPermissionsComponent implements OnInit {
  title = _TRANSLATE('Assign User Permissions');
  breadcrumbs: Array<Breadcrumb> = [];
  username;
  permissionsList;
  usersPermissions;
  constructor(private route: ActivatedRoute, 
    private authenticationService:AuthenticationService, 
    private permissionsService:NgxPermissionsService) { }

  async ngOnInit(){
    this.username = this.route.snapshot.paramMap.get('username')
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Security'),
        url: `security`
      },
      <Breadcrumb>{
        label: `${_TRANSLATE('Assign Permissions to')} ${this.username}`,
        url: `security/permissions/${this.username}`
      }
    ]

    this.permissionsList = await this.authenticationService.getPermissionsList()
    this.usersPermissions = this.permissionsService.getPermissions();
  }

  async addPermissionsToUser(){
    
  }

}
