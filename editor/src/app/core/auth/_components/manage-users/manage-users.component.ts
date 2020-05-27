import { MenuService } from './../../../../shared/_services/menu.service';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../_services/user.service';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {
  users;
  usersDisplayedColumns = ['username', 'email', 'actions']

  constructor(
    private userService: UserService,
    private menuService: MenuService,
    private errorHandler: TangyErrorHandler
  ) { }

  async ngOnInit() {
    this.menuService.setContext(_TRANSLATE('Manage Users'), '', 'manage-users')
    try {
      this.users = await this.userService.getAllUsers();
    } catch (error) {
      console.error(error);
    }
  }

  async deleteUser(username) {
    try {
      const confirmDelete = confirm(`${_TRANSLATE('Delete User')} ${username}?`);
      if (confirmDelete) {
        await this.userService.deleteUser(username);
      }
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could not delete user'));
    }
  }

}
