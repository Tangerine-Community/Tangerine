import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { GroupsService } from './../services/groups.service';
import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/auth/_services/user.service';
import { AuthenticationService } from 'src/app/core/auth/_services/authentication.service';


@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {

  title:string = ''
  breadcrumbs:Array<Breadcrumb>
  isAdminUser = false
  group
  constructor(
    private groupsService: GroupsService,
    private userService: UserService,
    private authenticationService: AuthenticationService
  ) {}

  async ngOnInit() {
    this.isAdminUser = await this.userService.isCurrentUserAdmin()
    this.group = await this.groupsService.getGroupInfo(window.location.hash.split('/')[2])
    this.title = this.group.label
    this.breadcrumbs = []
    await this.authenticationService.getUserGroupPermissionsByGroupName(this.group._id);
  }
/**
 * Check if a user has a specific permission in a specific group
 * @param permission A string containing the permission that a user must have on the group in order to access the resource
 * @return boolean
 *  @example ```<div *ngIf="hasAPermission('can_manage_group_deployment')"></div>```
 *
 * This div will only be shown if the user has the`can_manage_group_deployment` permission for this group
 */
  hasAPermission(permission: string) {
    return this.authenticationService.doesUserHaveAPermission(this.group._id, permission);
  }


/**
 * @param permissions an array of strings with permissions required to access the resource.
 *  A user must have all the specified permissions in order to access the resource
 * @return boolean
 * @example ```<div *ngIf="hasAllPermissions(['can_manage_group_deployment','can_deploy_apk'])"></div>```
 * This div will only be shown only if the user has the 'can_manage_group_deployment' and 'can_deploy_apk' permissions on this group
 */
  hasAllPermissions(permissions: string[]) {
    return this.authenticationService.doesUserHaveAllPermissions(this.group._id, permissions);
  }


/**
 * @param permissions an array of strings with permissions required to access the resource.
 *  A user must have at least one of  the specified permissions in order to access the resource
 * @return boolean
 * @example ```<div *ngIf="hasSomePermissions(['can_manage_group_deployment','can_deploy_apk'])"></div>```
 * This div will only be shown if the user has either 'can_manage_group_deployment' or 'can_deploy_apk' permissions on this group
 */
  hasSomePermissions(permissions: string[]) {
    return this.authenticationService.doesUserHaveSomePermissions(this.group._id, permissions);
  }
}
