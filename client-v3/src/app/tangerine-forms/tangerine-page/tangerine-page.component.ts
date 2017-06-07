import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {Validators, FormGroup} from '@angular/forms';
import { TangerinePageConfig } from './tangerine-page-config';

@Component({
  selector: 'app-tangerine-page',
  templateUrl: './tangerine-page.component.html',
  styleUrls: ['./tangerine-page.component.css']
})
export class TangerinePageComponent implements OnInit {

  // Input default model data for form.
  private _model: object;
  @Input()
  set model (value: TangerinePageConfig) {
    this._model = value;
  }
  get model () {
    return this._model;
  }

  // Input the configuration for the page.
  private _config: TangerinePageConfig;
  @Input()
  set config (value: TangerinePageConfig) {
    this._config = value;
  }
  get config () {
    return this._config;
  }
  @Output() submit: EventEmitter<Object> = new EventEmitter();

  form: FormGroup = new FormGroup({});
  // TODO: Move these to TangerinePage Model? To TangerineForm Component?
  showNextButton: Boolean = true;
  showPreviousButton: Boolean = true;

  data = {
  };

  onFormSubmit(formModel) {
    this.submit.emit(formModel);
  };

  constructor() { }

  ngOnInit() {
  }

}
