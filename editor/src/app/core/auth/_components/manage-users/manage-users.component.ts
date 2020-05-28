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
  activeUsers;
  archivedUsers;
  usersDisplayedColumns = ['username', 'email', 'actions']

  constructor(
    private userService: UserService,
    private menuService: MenuService,
    private errorHandler: TangyErrorHandler
  ) { }

  async ngOnInit() {
    this.menuService.setContext(_TRANSLATE('Users'), '', 'users')
    this.getAllUsers();
  }

  async getAllUsers() {
    try {
      this.activeUsers = [...await this.userService.getAllUsers()].filter(user => user.isActive);
      this.archivedUsers = [...await this.userService.getAllUsers()].filter(user => !user.isActive);
    } catch (error) {
      this.activeUsers = [];
      this.archivedUsers = [];
      console.error(error);
    }
  }
  async deleteUser(username) {
    try {
      const confirmDelete = confirm(`${_TRANSLATE('Delete User named')} "${username}"?`);
      if (confirmDelete) {
        if (await this.userService.deleteUser(username)) {
          this.errorHandler.handleError(_TRANSLATE('User Deleted Successfully'));
          this.getAllUsers();
        } else {
          this.errorHandler.handleError(_TRANSLATE('Could not delete user'));
        }
      }
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could not delete user'));
    }
  }

  async restoreUser(username) {
    try {
      const confirmRestore = confirm(`${_TRANSLATE('Restore User named')} "${username}"?`);
      if (confirmRestore) {
        if (await this.userService.restoreUser(username)) {
          this.errorHandler.handleError(_TRANSLATE('User Restored Successfully'));
          this.getAllUsers();
        } else {
          this.errorHandler.handleError(_TRANSLATE('Could not restore user'));
        }
      }
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could not restore user'));
    }
  }

}
