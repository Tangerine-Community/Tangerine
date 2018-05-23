import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  errorMessage = '';
  returnUrl: string; // stores the value of the url to redirect to after login
  user = { username: '', password: '' };
  users = [];
  showRecoveryInput = false;
  securityQuestionText;
  allUsernames;
  listUsernamesOnLoginScreen;
  constructor() { }

  ngOnInit() {
  }

}
