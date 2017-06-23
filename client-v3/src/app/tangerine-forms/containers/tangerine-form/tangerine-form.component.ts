import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Store, provideStore } from '@ngrx/store';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { TangerineFormPage } from '../../models/tangerine-form-page';
import { TangerineFormSession } from '../../models/tangerine-form-session';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';


@Component({
  selector: 'tangerine-form',
  templateUrl: './tangerine-form.component.html',
  styleUrls: ['./tangerine-form.component.css'],
  animations: [
  trigger('formStatus', [
    state('INITIALIZED', style({
      backgroundColor: '#FFF',
      transform: 'scale(1.0)'
    })),
    state('DONE',   style({
      backgroundColor: '#afd29a',
      transform: 'scale(1.01)'
    })),
    transition('INITIALIZED => DONE', animate('100ms ease-in')),
    transition('DONE => INITIALIZED', animate('100ms ease-out'))
  ])
]
})
export class TangerineFormComponent implements OnInit {

  private _tangerineFormPage: TangerineFormPage = new TangerineFormPage();
  form: FormGroup;
  // Insert session.
  @Input() tangerineFormSession: any;
  // Local copy of state.
  _tangerineFormSession: TangerineFormSession = new TangerineFormSession();
  // status$: Observable<string>;
  status = '';
  swipe = 'RIGHT';
  _model: any;

  constructor(fb: FormBuilder, private store: Store<any>) {
    // Subrcribe to the store so we can receive updates when we are on a new page.
    store.select('tangerineFormSession')
      .subscribe((tangerineFormSession: TangerineFormSession) => {
        this.status = tangerineFormSession.status;
        this.swipe = tangerineFormSession.swipe;
        // Don't assign until the form is initialized.
        if (tangerineFormSession.hasOwnProperty('pages') && tangerineFormSession.pages.length > 0) {
          this._tangerineFormPage = tangerineFormSession.pages[tangerineFormSession.pageIndex];
        }
      });
    // Instantiate a Reactive Angular Form.
    this.form = fb.group({});

  }

  ngOnInit() {
    this.store.dispatch({type: 'FORM_LOAD', payload: this.tangerineFormSession});
    // Bubble up form changes.
    this.form.valueChanges.subscribe(model => {
      if (model) {
        this.store.dispatch({
          type: 'FORM_UPDATE',
          payload: {
            status: this.form.status,
            model
          }
        });
      }
    });
  }


  clickedNext(model) {
    this.store.dispatch({ type: 'GO_TO_NEXT_PAGE' });
  }

  clickedPrevious(model) {
    this.store.dispatch({ type: 'GO_TO_PREVIOUS_PAGE' });
  }

}
