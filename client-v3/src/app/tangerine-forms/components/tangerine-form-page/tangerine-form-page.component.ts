import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Store, provideStore } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { TangerineFormPage } from '../../models/tangerine-form-page';
import { TangerineFormSession } from '../../models/tangerine-form-session';

@Component({
  selector: 'tangerine-form-page',
  templateUrl: './tangerine-form-page.component.html',
  styleUrls: ['./tangerine-form-page.component.css']
})
export class TangerineFormPageComponent implements OnInit {

  tangerineFormPage: TangerineFormPage;
  form: FormGroup;

  constructor(fb: FormBuilder, private store: Store<any>) {
    store.select('tangerineFormSession')
      .subscribe((tangerineFormSession: TangerineFormSession) => {
        // Don't assign until the form is initialized.
        if (tangerineFormSession.hasOwnProperty('sections') && tangerineFormSession.sections.length > 0) {
          this.tangerineFormPage = tangerineFormSession
            .sections[tangerineFormSession.sectionIndex]
            .pages[tangerineFormSession.pageIndex];
        }
      });
    this.form = fb.group({});
  }

  ngOnInit() {
    // Bubble up form changes.
    this.form.valueChanges.subscribe(model => {
      this.store.dispatch({
        type: 'FORM_PAGE_UPDATE',
        payload: {
          status: this.form.status,
          model: model
        }
      });
    });
  }
}
