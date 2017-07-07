/*
 * Component: <tangerine-form>
 * Projects a series of <tangerine-form-card> components, subcribes to their change events, aggregates their models and sends that
 * aggregated model back down to the card components.
 */

import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChildren, ElementRef, QueryList, ContentChildren } from '@angular/core';
import { Store, provideStore } from '@ngrx/store';
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
  @Input() session: TangerineFormSession = new TangerineFormSession();
  @Input() formId = '';
  // Latch onto the children Cards so we can listen for their events.
  // @ContentChildren(TangerineBaseCardComponent, {descendants: true}) tangerineFormCardChildren: QueryList<TangerineBaseCardComponent>;
  @ContentChildren(TangerineFormCardComponent) tangerineFormCardChildren: QueryList<TangerineFormCardComponent>;
  constructor(private store: Store<any>) {

  }


  ngOnInit() {
    /*
    this.store.dispatch({
            type: 'TANGERINE_FORM_SESSION_ASSIGN_FORM_ID',
            payload: {
              // sessionId: tangerineFormSession._id,
              formId: this.formId
            }
          });
    */
    // Subscribe to the active Tangerine Form Session.
    this.store.select('tangerineFormSession')
      .subscribe((tangerineFormSession: TangerineFormSession) => {
        debugger;
        /*
        if (tangerineFormSession.formId === '') {
          this.store.dispatch({
            type: 'TANGERINE_FORM_SESSION_ASSIGN_FORM_ID',
            payload: {
              sessionId: tangerineFormSession._id,
              formId: this.formId
            }
          });
        } else if (tangerineFormSession.formId !== this.formId || tangerineFormSession._id !== this.session._id) {
          alert('You have another Form Session active. Please close this tab.');
        } else {
          this.session = tangerineFormSession;
        }
        */
      });
    /*
    if (this.formId) {
      this.session.formId = this.formId;
    }
    */
    // Check for an active Tangerine Form Session. If there isn't one, then dispatch an action to start one.
    this.store.dispatch({type: 'TANGERINE_FORM_SESSION_START', payload: this.session});
  }

  // TODO: Should be ngAfterContentInit?
  ngAfterViewInit() {
    console.log(this.formId);
    this.tangerineFormCardChildren.setDirty();
    this.tangerineFormCardChildren.forEach((tangerineFormCardComponent, index, cards) => {
      debugger;
      // Assign the session model to the tangerineFormCard model so it is a shared model state between all the cards.
      tangerineFormCardComponent.tangerineFormCard.model = this.session.model;
      // Listen for changes to all cards. When they change, dispatch an event with the card that changed and the sessionId.
      tangerineFormCardComponent.change.subscribe((tangerineFormCard) => {
        // TODO: Causes infinite loop?
        /*
        this.store.dispatch({type: 'TANGERINE_FORM_CARD_CHANGE', payload: {
          sessionId: this.session._id,
          cardModel: tangerineFormCard
        }});
        */
        // TODO: This is now down in the store subscribe. Have we done it correctly?
        // Object.assign(this.session.model, tangerineFormCard.model);
      });
    });
  }

}
