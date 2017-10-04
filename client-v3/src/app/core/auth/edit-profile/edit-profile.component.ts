import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from 'ng-formly';
@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  form: FormGroup = new FormGroup({});
  userFields = [
    {
      key: 'password',
      type: 'input',

      templateOptions: {
        label: 'Password',
        placeholder: 'Password',
        value: 'Evans',
        mdInput: ''
      }
    }
  ];

  user = {
    email: 'email@gmail.com',
    checked: false
  };

  submit(user) {
    console.log(user);
  }
  constructor() { }

  ngOnInit() {
  }

}
