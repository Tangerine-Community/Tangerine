import { Component, OnInit, AfterContentInit } from '@angular/core';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { UserService } from '../../_services/user.service';
import { User } from './user.model.interface';
import {ActivatedRoute} from '@angular/router';


@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.css']
})
export class UserRegistrationComponent implements OnInit, AfterContentInit {

  user: User = {
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: ''
  };
  userExists: boolean = null;
  userNameUnavailableMessage = { type: 'error', message: _TRANSLATE('Username Unavailable') };
  userNameAvailableMessage = { type: 'success', message: _TRANSLATE('Username Available') };
  couldNotCreateUserMessage = { type: 'error', message: _TRANSLATE('Could Not Create User') };
  id: string;

  constructor(private userService: UserService, private errorHandler: TangyErrorHandler, private route: ActivatedRoute) { }

  ngOnInit() {
  }

  async ngAfterContentInit() {
    this.route.params.subscribe(async params => {
      this.id = params.id;
      // await this.userService.doesUserExist(this.id);
    })
  }

  async createUser() {
    try {
      delete this.user.confirmPassword;
      const userData = Object.assign({}, this.user);
      if (!(await this.doesUserExist(this.user.username))) {
        const result: any = await this.userService.createUser(userData);
        if (result && result.statusCode && result.statusCode === 200) {
          this.errorHandler.handleError(_TRANSLATE('User Created Succesfully'));
          this.user = {
            username: '',
            password: '',
            email: '',
            firstName: '',
            lastName: ''
          };
        } else {
          this.errorHandler.handleError(_TRANSLATE('Could Not Create User'));
        }
        return result;
      }
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could Not Create User'));
    }
  }

  async doesUserExist(username: string) {
    try {
      this.user.username = username.replace(/\s/g, ''); // Remove all whitespaces including spaces and tabs
      if (this.user.username.length > 0) {
        this.userExists = <boolean>await this.userService.doesUserExist(username);
        return this.userExists;
      } else {
        this.userExists = null;
        return this.userExists;
      }
    } catch (error) {
      console.error(error);
    }
  }

}
