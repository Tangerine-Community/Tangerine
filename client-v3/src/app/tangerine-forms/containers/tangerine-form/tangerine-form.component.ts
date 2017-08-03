/*
 * Component: <tangerine-form>
 * Projects a series of <tangerine-form-card> components, subcribes to their change events, aggregates their models and sends that
 * aggregated model back down to the card components.
 */

import { Component, OnInit, OnDestroy, AfterViewInit, AfterContentInit, Input, Output, EventEmitter, ViewChildren, ElementRef, QueryList, ContentChildren, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import * as PouchDB from 'pouchdb';
import { ActivatedRoute, Router } from '@angular/router';
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

  private subscription: any;

  // A place to stash all the form elements we find inside of this component for input output management.
  private forms: Array<any> = [];
  private elements: Array<any> = [];

  // Set the store to a local store property.
  constructor(private store: Store<any>,
    private service: TangerineFormSessionsService,
    private elementRef: ElementRef,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(DOCUMENT) private document: any) {
    // TODO: In the future, it would be nice if Components did not have to be in charge of activating Effects.
    //       Perhaps we could make effects reducers that misbehave.
    this._effects = new TangerineFormSessionsEffects(store, service);
  }

  ngOnDestroy() {
    this._effects.subscription.unsubscribe();
    this.subscription.unsubscribe();
    this.forms.forEach(form => form.removeEventListener('change'));
  }

  ngOnInit() {

  }

  ngAfterContentInit() {
    // Listen for clicks on Buttons with `formaction` attributes. Note those are translated to `button.formAction` properties.
    this.elementRef.nativeElement.querySelectorAll('button').forEach((button) => {
      if (button.formAction !== this.document.location.href) {
        button.addEventListener('click', (event) => {
          let foundUnmetRequiredElement = false;
          let foundInvalidElement = false;
          for (const element of event.currentTarget.form.elements) {
            if (element.required === true && element.value === '') {
              foundUnmetRequiredElement = true;
              alert('You have required fields you must fill out.');
            }
            if (element.validity.valid === false) {
              foundInvalidElement = true;
              alert(element.validationMessage);
            }
            if (!foundInvalidElement && !foundUnmetRequiredElement) {
              // Form action is transformed into a full URL, cut out what we need.
              const formAction = event.currentTarget.formAction;
              const positionOfThirdForwardSlash = formAction.split('\/', 3).join('\/').length;
              const angularURL = formAction.substring(positionOfThirdForwardSlash, formAction.length);
              this.router.navigate([angularURL]);
            }
          }
        });
      }
    });
    // Find all forms and stash their reference. Skip Formly Forms, they are special.
    this.elementRef.nativeElement.querySelectorAll('form').forEach((form) => {

      // @TODO: If you put a debugger statement it will work but...
      if (form.className !== 'formly') {
        // ... if you put a debugger statement here it will never hit but a console log will.
        this.forms.push(form);
        // Note if you want the form elements of a form in an array do Array.prototype.slice.call(form.elements,0).
      }
    });
    // Get all elements.
    this.forms.forEach((form) => {
      Array.prototype.slice.call(form.elements, 0).forEach((element) => {
        this.elements.push(element);
      });
    });
    // Spread the elements to all forms.
    this.forms.forEach((form) => {
      this.elements.forEach(element => form.elements[element.id] = element);
    });
    // Subscribe to all form change events so we can pass actions up to the reducer.
    this.forms.forEach((form) => {
      form.addEventListener('change', (event) => {
        // Echo the change event to other forms on the page.
        this.forms.forEach(form => {
          if (form.id !== event.srcElement.id && form.onchange) {
            form.onchange(event);
          }
        });
        // Dispatch action to the store so data model will update.
        this.store.dispatch({
          type: 'TANGERINE_FORM_ELEMENT_UPDATE',
          payload: {
            element: event.srcElement,
          }
        });
      });
    });
    // @TODO This timer is a shame.
    setTimeout(() => {
      for (const form of this.forms) {
        const event = new Event('change');
        // Dispatch the event.
        form.dispatchEvent(event);
      }
    }, 200);
  }

  ngAfterViewInit() {

    // Subscribe to Tangerine Form Session store so we can apply updates.
    this.subscription = this.store.select('tangerineFormSession')
      .subscribe((tangerineFormSession: TangerineFormSession) => {
        const sessionId = this.route.queryParams.first();
        // Is there no session or the session doesn't match this form? Call home for one and this will come back around.
        if (!tangerineFormSession || tangerineFormSession.formId !== this.formId) {
          this.store.dispatch({type: 'TANGERINE_FORM_SESSION_START', payload: { formId: this.formId }});
        }
        // We now have a session for this Component, do this only once because all other times are an update.
        else if (!this.session) {
          // Spread the Session around.
          this.session = tangerineFormSession;
          // Set HTML form elements.
          for (const element of this.elements) {
            if (this.session.model.hasOwnProperty(element.id)) {
              switch (element.type) {
                case 'checkbox':
                  element.checked = this.session.model[element.id];
                break;
                case 'option':
                  // @TODO
                break;
                default:
                  element.value = this.session.model[element.id];
                break;
              }
            }
          }
          // Spread to Tangerine Form Cards.
          this.tangerineFormCardChildren.forEach((tangerineFormCardComponent, index, cards) => {
            tangerineFormCardComponent.tangerineFormCard.model = Object.assign({}, this.session.model);
          });
          // Subscribe to all of the cards change events.
          this.tangerineFormCardChildren.forEach((tangerineFormCardComponent, index, cards) => {
            if (tangerineFormCardComponent.tangerineFormCard.showSubmitButton === false) {
              tangerineFormCardComponent.change.subscribe((tangerineFormCard) => {
                // Protect from an infinite loop because of how Formly works.
                const potentialModel = Object.assign({}, this.session.model, tangerineFormCard.model);
                if (JSON.stringify(potentialModel) !== JSON.stringify(this.session.model)) {
                  this.store.dispatch({
                    type: 'TANGERINE_FORM_FORMLY_UPDATE',
                    payload: tangerineFormCard.model
                  });
                };
              });
            } else {
              tangerineFormCardComponent.submit.subscribe((tangerineFormCard) => {
                // Protect from an infinite loop because of how Formly works.
                const potentialModel = Object.assign({}, this.session.model, tangerineFormCard.model);
                if (JSON.stringify(potentialModel) !== JSON.stringify(this.session.model)) {
                  this.store.dispatch({
                    type: 'TANGERINE_FORM_FORMLY_UPDATE',
                    payload: tangerineFormCard.model
                  });
                };
              });
            }

          });
        }
        // We have an update to the session.
        else {
          this.session = tangerineFormSession;
          this.tangerineFormCardChildren.forEach((tangerineFormCardComponent, index, cards) => {
            tangerineFormCardComponent.tangerineFormCard.model = Object.assign({}, this.session.model);
          });
        };

      });

  }



}
