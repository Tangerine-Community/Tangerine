import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {Validators, FormGroup, FormBuilder } from '@angular/forms';
import { TangerinePageConfig } from './tangerine-page-config';

@Component({
  selector: 'app-tangerine-page',
  templateUrl: './tangerine-page.component.html',
  styleUrls: ['./tangerine-page.component.css']
})
export class TangerinePageComponent implements OnInit {

  // The model of data to use with
  @Input()model: any;
  // JSON describing the fields on the page.
  @Input() config: TangerinePageConfig;

  // Output all user input updates.
  @Output() update: EventEmitter<Object> = new EventEmitter();

  form: FormGroup;

  constructor(fb: FormBuilder) {
    this.form = fb.group({});
  }

  ngOnInit() {
    // Bubble up form changes.
    this.form.valueChanges.subscribe(model => {
      this.update.emit({
        status: this.form.status,
        variables: model
      });
    });
  };

}
