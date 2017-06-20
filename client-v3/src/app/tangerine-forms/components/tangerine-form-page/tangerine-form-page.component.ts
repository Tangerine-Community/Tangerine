import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { TangerineFormPage } from '../../models/tangerine-form-page';

@Component({
  selector: 'app-tangerine-form-page',
  templateUrl: './tangerine-form-page.component.html',
  styleUrls: ['./tangerine-form-page.component.css']
})
export class TangerineFormPageComponent implements OnInit {
  // The model of data to use with
  @Input()model: any;
  // JSON describing the fields on the page.
  @Input() config: TangerineFormPage;
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
  }
}
