import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {Validators, FormGroup} from '@angular/forms';
import { TangerinePage } from './tangerine-page';

@Component({
  selector: 'app-tangerine-page',
  templateUrl: './tangerine-page.component.html',
  styleUrls: ['./tangerine-page.component.css']
})
export class TangerinePageComponent implements OnInit {
  form: FormGroup = new FormGroup({});
  private _config: TangerinePage;
  showNextButton: Boolean = true;
  showPreviousButton: Boolean = true;

  @Input()
  set config (value: TangerinePage) {
    this._config = value;
  }
  get config () {
    return this._config;
  }

  @Output() submit: EventEmitter<Object> = new EventEmitter();

  data = {
  };

  onFormSubmit(formModel) {
    this.submit.emit(formModel);
  };

  constructor() { }

  ngOnInit() {
  }

}
