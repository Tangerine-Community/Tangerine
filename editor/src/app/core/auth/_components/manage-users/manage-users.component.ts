import { Component, OnInit } from '@angular/core';
import { UserService } from '../../_services/user.service';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {
  users;
  constructor(private userService: UserService) { }

  async ngOnInit() {
    try {
      this.users = await this.userService.getAllUsers();
    } catch (error) {
      console.error(error);
    }
  }

}
