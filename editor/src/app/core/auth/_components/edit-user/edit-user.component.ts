import { Component, OnInit } from '@angular/core';
import { User } from '../user-resgistration/user.model.interface';
import { UserService } from '../../_services/user.service';
import { ActivatedRoute } from '@angular/router';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  user: User;
  constructor(private userService: UserService, private route: ActivatedRoute, private errorHandler: TangyErrorHandler) { }

  async ngOnInit() {
    this.user = await this.userService.getAUserByUsername(this.route.snapshot.paramMap.get('username')) as User;
    this.user.password = '';
    this.user.confirmPassword = '';
  }

  async editUser() {
    try {
      const data = await this.userService.updateUserDetails(this.user);
      if (data === 200) {
        this.errorHandler.handleError(_TRANSLATE('USer Details Updated Successfully'));
      } else {
        this.errorHandler.handleError(_TRANSLATE('USer Details could not be Updated'));
      }
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('USer Details could not be Updated'));
    }
  }
}
