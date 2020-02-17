import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { MenuService } from './../../../../shared/_services/menu.service';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../_services/user.service';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {
  users;
  constructor(
    private userService: UserService,
    private menuService:MenuService
  ) { }

  async ngOnInit() {
    this.menuService.setContext(_TRANSLATE('Manage Users'), '', 'manage-users')
    try {
      this.users = await this.userService.getAllUsers();
    } catch (error) {
      console.error(error);
    }
  }

}
