import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {Validators, FormGroup, FormBuilder } from '@angular/forms';
import { TangerinePageConfig } from './tangerine-page-config';

@Component({
  selector: 'app-tangerine-page',
  templateUrl: './tangerine-page.component.html',
  styleUrls: ['./tangerine-page.component.css']
})
export class TangerinePageComponent implements OnInit {

  // Input default model data for form.
  private _model: object = {};
  @Input()
  set model (value: TangerinePageConfig) {
    this._model = value;
  }
  get model () {
    return this._model;
  }

  // Input the configuration for the page.
  private _config: TangerinePageConfig = {};
  @Input()
  set config (value: TangerinePageConfig) {
    this._config = value;
  }
  get config () {
    return this._config;
  }

  // Output all user input updates.
  @Output() update: EventEmitter<Object> = new EventEmitter();

  form: FormGroup = new FormGroup({});

  constructor(fb: FormBuilder) {
    this.form = fb.group({});
  }

  ngOnInit() {
    // Output all user input updates.
    this.form.valueChanges.subscribe(variables => {
      this.update.emit({
        status: this.form.status,
        variables: variables
      });
    });
  }

}
