import { Component, OnInit } from '@angular/core';
import { User } from '../user-resgistration/user.model.interface';
import { UserService } from '../../_services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  user: User;
  updateUserPassword = false;
  statusMessage = { type: '', message: '' };
  disableSubmit = false;
  passwordIsNotStrong = { type: 'error', message: _TRANSLATE('Password is not strong enough.') };
  incorrectAdminPassword = { type: 'error', message: _TRANSLATE('Incorrect Admin Password') };
  passwordPolicy: string
  passwordRecipe: string
  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private errorHandler: TangyErrorHandler,
    private router: Router,
    private httpClient: HttpClient
  ) { }

  async ngOnInit() {
    this.user = await this.userService.getAUserByUsername(this.route.snapshot.paramMap.get('username')) as User;
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
      }
      const policy = new RegExp(this.passwordPolicy)
      if (!policy.test(this.user.password)) {
        this.statusMessage = this.passwordIsNotStrong
        // this.disableSubmit = true
        // this.errorHandler.handleError(this.passwordIsNotStrong.message);
        return
      } else {
        // Clear out statusMessage is it had been set earlier.
        this.statusMessage = { type: '', message: '' };
      }
      const data = await this.userService.updateUserDetails({...this.user, updateUserPassword: this.updateUserPassword});
      if (data === 200) {
        this.errorHandler.handleError(_TRANSLATE('User Details Updated Successfully'));
        this.router.navigate(['users'])
      } else {
        this.errorHandler.handleError(_TRANSLATE('User Details could not be Updated'));
      }
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('User Details could not be Updated'));
    }
  }
}
