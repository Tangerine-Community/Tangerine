import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { Store, provideStore } from '@ngrx/store';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { safeLoad } from 'js-yaml';
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


@Component({
  selector: 'tangerine-form',
  templateUrl: './tangerine-form.component.html',
  styleUrls: ['./tangerine-form.component.css'],

})
export class TangerineFormComponent implements OnInit, AfterViewInit {

  // Send a Tangerine Form in.
  @Input() tangerineForm: TangerineForm = new TangerineForm();
  // Or send a Tangerine Session in.
  @Input() tangerineFormModel: TangerineFormSession = new TangerineFormSession();
  // Latch onto the children Cards so we can listen for their events.
  @ViewChildren(TangerineFormCardComponent) tangerineFormCardChildren: QueryList<TangerineFormCardComponent>;
  // Config may come through the element.
  private internalEl: any;

  // Pass the store in so we can subscribe to tangerineFormSession.
  constructor(private store: Store<any>, el: ElementRef) {
    this.internalEl = el;
  }

  ngOnInit() {
    let inlineConfig = this.internalEl.nativeElement.innerHTML;
    inlineConfig = inlineConfig.substring(inlineConfig.lastIndexOf('START-CONFIG'), inlineConfig.lastIndexOf('END-CONFIG'));
    if (inlineConfig) {
      inlineConfig = inlineConfig.split('\n');
      inlineConfig.splice(0, 2);
      inlineConfig.splice(inlineConfig.length - 2, inlineConfig.length);
      inlineConfig = safeLoad(inlineConfig.join('\n'));
      Object.assign(this.tangerineForm, inlineConfig);
    }
    console.log(this.tangerineForm);
    // TODO: Subscribe by TangerineFormSession.id
    // Pull down state changes.
    this.store.select('tangerineFormSession')
      .subscribe((tangerineFormSession: TangerineFormSession) => {
        this.tangerineFormModel = tangerineFormSession;
      });

    this.tangerineForm.cards.forEach((card) => {
      card.model = this.tangerineFormModel;
    });

    // Start a new Tangerine Form Session.
    this.store.dispatch({type: 'TANGERINE_FORM_SESSION_START', payload: this.tangerineForm});

    // Push state changes up When Cards change.
    /*
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
    */
  }

  ngAfterViewInit() {
    console.log(this.tangerineFormCardChildren);
    this.tangerineFormCardChildren.forEach((tangerineFormCardComponent, index, cards) => {
      tangerineFormCardComponent.change.subscribe((tangerineFormCard) => {
        this.store.dispatch({type: 'TANGERINE_FORM_CARD_CHANGE', payload: tangerineFormCard.model});
      });
    });
    /*
    this.tangerineFormCardChildren.change.subscribe((tangerineFormCard) => {
      console.log(tangerineFormCard);
    });
    */

  }

}
