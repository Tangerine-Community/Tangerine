import { Component, OnInit, Input } from '@angular/core';
import {Validators, FormGroup} from '@angular/forms';
import {FormlyFieldConfig} from 'ng-formly';

@Component({
  selector: 'app-tangerine-page',
  templateUrl: './tangerine-page.component.html',
  styleUrls: ['./tangerine-page.component.css']
})
export class TangerinePageComponent implements OnInit {
  form: FormGroup = new FormGroup({});
  _config: FormlyFieldConfig;

  @Input()
  set config (value: FormlyFieldConfig) {
    this._config = value;
  }
  get config () {
    return this._config;
  }

  user = {
    email: 'email@gmail.com',
    checked: false
  };

  submit(user) {
    console.log(user);
  };

  constructor() { }

  ngOnInit() {
  }

}
