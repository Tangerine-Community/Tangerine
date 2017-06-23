import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Store, provideStore } from '@ngrx/store';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { TangerineFormPage } from '../../models/tangerine-form-page';
import { TangerineFormSession } from '../../models/tangerine-form-session';



@Component({
  selector: 'tangerine-form',
  templateUrl: './tangerine-form.component.html',
  styleUrls: ['./tangerine-form.component.css']
})
export class TangerineFormComponent implements OnInit {

  private _tangerineFormPage: TangerineFormPage = new TangerineFormPage();
  form: FormGroup;
  // Insert session.
  @Input() tangerineFormSession: any;
  // Local copy of state.
  _tangerineFormSession: any;
  _model: any;

  constructor(fb: FormBuilder, private store: Store<any>) {
    // Subrcribe to the store so we can receive updates when we are on a new page.
    store.select('tangerineFormSession')
      .subscribe((tangerineFormSession: TangerineFormSession) => {
        // Don't assign until the form is initialized.
        if (tangerineFormSession.hasOwnProperty('sections') && tangerineFormSession.sections.length > 0) {
          this._tangerineFormPage = tangerineFormSession
                                        .sections[tangerineFormSession.sectionIndex]
                                        .pages[tangerineFormSession.pageIndex];
        }
      });
    // Instantiate a Reactive Angular Form.
    this.form = fb.group({});

  }

  ngOnInit() {
    this.store.dispatch({type: 'LOAD_FORM', payload: this.tangerineFormSession});
    // Bubble up form changes.
    this.form.valueChanges.subscribe(model => {
      this._model = model;
    });
  }


  clickedNext(model) {
    this.store.dispatch({
      type: 'PAGE_UPDATE',
      payload: {
        status: this.form.status,
        model
      }
    });
    this.store.dispatch({ type: 'GO_TO_NEXT_PAGE' });
  }

  clickedPrevious(model) {
    this.store.dispatch({
      type: 'PAGE_UPDATE',
      payload: {
        status: this.form.status,
        model
      }
    });
    this.store.dispatch({ type: 'GO_TO_PREVIOUS_PAGE' });

  }

}
