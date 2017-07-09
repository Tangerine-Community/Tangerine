/*
 * Component: <tangerine-form>
 * Projects a series of <tangerine-form-card> components, subcribes to their change events, aggregates their models and sends that
 * aggregated model back down to the card components.
 */

import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChildren, ElementRef, QueryList, ContentChildren } from '@angular/core';
import * as PouchDB from 'pouchdb';
import { Store, provideStore } from '@ngrx/store';
import { TangerineFormSessionsService } from '../../services/tangerine-form-sessions.service';
import { TangerineFormSessionsEffects } from '../../effects/tangerine-form-sessions-effects';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { TangerineFormCard } from '../../models/tangerine-form-card';
import { TangerineFormSession } from '../../models/tangerine-form-session';
import { TangerineForm } from '../../models/tangerine-form';
import { TangerineFormCardComponent } from '../../components/tangerine-form-card/tangerine-form-card.component';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import {TangerineBaseCardComponent} from '../../models/tangerine-base-card';


@Component({
  selector: 'tangerine-form',
  templateUrl: './tangerine-form.component.html',
  styleUrls: ['./tangerine-form.component.css'],

})
export class TangerineFormComponent implements OnInit, AfterViewInit {

  // Send a Tangerine Form in.
  @Input() form: TangerineForm = new TangerineForm();
  // Or send a Tangerine Session in.
  @Input() session: TangerineFormSession;
  @Input() formId = '';
  // Query the abstract base class TangerineBaseCardComponent and find its children.
  // This enables us to latch onto the children Cards so we can listen for their events.
  // See https://github.com/Tangerine-Community/Tangerine/issues/369 for more information
  @ContentChildren(TangerineBaseCardComponent) tangerineFormCardChildren: QueryList<TangerineBaseCardComponent>;

  private _effects: TangerineFormSessionsEffects;

  // Set the store to a local store property.
  constructor(private store: Store<any>, private service: TangerineFormSessionsService) {
    // TODO: In the future, it would be nice if Components did not have to be in charge of activating Effects.
    //       Perhaps we could make effects reducers that misbehave.
    // Enable Effects.
    // TODO: Destroy this effect on ngOnDestroy and save one last time.
    this._effects = new TangerineFormSessionsEffects(store, service);
  }

  ngOnInit() {



  }

  ngAfterViewInit() {

    // Subscribe Tangerine Form Session.
    this.store.select('tangerineFormSession')
      .subscribe((tangerineFormSession: TangerineFormSession) => {

        // No Session or the session doesn't match this form? Call home for one and this will come back around.
        if (!tangerineFormSession || tangerineFormSession.formId !== this.formId) {
          this.store.dispatch({type: 'TANGERINE_FORM_SESSION_START', payload: { formId: this.formId }});
        }
        // We have a new session.
        else if (!this.session) {
          // Spread the Session around.
          this.session = tangerineFormSession;
          this.tangerineFormCardChildren.forEach((tangerineFormCardComponent, index, cards) => {
            tangerineFormCardComponent.tangerineFormCard.model = this.session.model;
          });
          // Subscribe to all of the cards change events.
          this.tangerineFormCardChildren.forEach((tangerineFormCardComponent, index, cards) => {
            tangerineFormCardComponent.change.subscribe((tangerineFormCard) => {
              this.store.dispatch({
                type: 'TANGERINE_FORM_SESSION_MODEL_UPDATE',
                payload: tangerineFormCard.model
              });
            });
          });
        }
        // We have an update to the session.
        else {
          // this.session = tangerineFormSession;
        };

      });

  }



}
