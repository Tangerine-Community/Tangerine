import { Component, OnInit } from '@angular/core';
import { MenuService } from 'src/app/shared/_services/menu.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { UserService } from '../../_services/user.service';
import { User } from '../user-resgistration/user.model.interface';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';

@Component({
  selector: 'app-update-personal-profile',
  templateUrl: './update-personal-profile.component.html',
  styleUrls: ['./update-personal-profile.component.css']
})
export class UpdatePersonalProfileComponent implements OnInit {

  user;
  updateUserPassword = false;
  constructor(private menuService: MenuService, private userService: UserService, private errorHandler: TangyErrorHandler) { }

  async ngOnInit() {
    this.menuService.setContext(_TRANSLATE('Update Personal Profile'));
    this.user = await this.userService.getAUserByUsername(await this.userService.getCurrentUser());
    this.user.password = '';
    this.user.confirmPassword = '';
  }
  async editUser() {
    try {
      if (!this.updateUserPassword) {
        this.user.password = null;
        this.user.confirmPassword = null;
        this.user.currentPassword = null;
      }
      const data = await this.userService.updatePersonalProfile({...this.user, updateUserPassword: this.updateUserPassword});
      if (data === 200) {
        this.errorHandler.handleError(_TRANSLATE('User Details Updated Successfully'));
      } else {
        this.errorHandler.handleError(_TRANSLATE('User Details could not be Updated'));
      }
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('User Details could not be Updated'));
    }
  }
}
