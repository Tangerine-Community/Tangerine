import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MenuService } from 'src/app/shared/_services/menu.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { UserService } from '../../_services/user.service';
import { User } from '../user-resgistration/user.model.interface';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import {ServerConfigService} from "../../../../shared/_services/server-config.service";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-update-personal-profile',
  templateUrl: './update-personal-profile.component.html',
  styleUrls: ['./update-personal-profile.component.css']
})
export class UpdatePersonalProfileComponent implements OnInit {

  user;
  updateUserPassword = false;
  statusMessage = { type: '', message: '' };
  disableSubmit = false;
  passwordIsNotStrong = { type: 'error', message: _TRANSLATE('Password is not strong enough.') };
  incorrectAdminPassword = { type: 'error', message: _TRANSLATE('Incorrect Admin Password') };
  passwordPolicy: string
  passwordRecipe: string
  config:any = { enabledModules: [] }
  
  constructor(
    private menuService: MenuService,
    private userService: UserService,
    private errorHandler: TangyErrorHandler,
    private router: Router,
    private httpClient: HttpClient
  ) { }

  async ngOnInit() {
    this.menuService.setContext(_TRANSLATE('Update My Profile'));
    this.user = await this.userService.getMyUser();
    this.user.password = '';
    this.user.confirmPassword = '';
    try {
      const result: any = await this.httpClient.get('/configuration/passwordPolicyConfig').toPromise();
      if(result.T_PASSWORD_POLICY){
        this.passwordPolicy = result.T_PASSWORD_POLICY;
      }
      if(result.T_PASSWORD_RECIPE){
        this.passwordRecipe = result.T_PASSWORD_RECIPE;
      }
    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
    this.passwordIsNotStrong.message = this.passwordIsNotStrong.message + ' ' + this.passwordRecipe
  }
  async editUser() {
    try {
      if (!this.updateUserPassword) {
        this.user.password = null;
        this.user.confirmPassword = null;
        this.user.currentPassword = null;
      }

      // const policy = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})');
      const policy = new RegExp(this.passwordPolicy)
      if (!policy.test(this.user.password)) {
        this.statusMessage = this.passwordIsNotStrong
        // this.disableSubmit = true
        // this.errorHandler.handleError(this.passwordIsNotStrong.message);
        return
      }
      
      const data = await this.userService.updateMyUser({...this.user, updateUserPassword: this.updateUserPassword});
      if (data === 200) {
        this.errorHandler.handleError(_TRANSLATE('User Details Updated Successfully'));
        this.router.navigate(['/'])
      } else {
        this.errorHandler.handleError(_TRANSLATE('User Details could not be Updated'));
      }
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('User Details could not be Updated'));
    }
  }
}
