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


@Component({
  selector: 'tangerine-form',
  templateUrl: './tangerine-form.component.html',
  styleUrls: ['./tangerine-form.component.css'],

})
export class TangerineFormComponent implements OnInit, AfterViewInit {

  // Send a Tangerine Form in.
  @Input() tangerineForm: TangerineForm = new TangerineForm();
  // Or send a Tangerine Session in.
  @Input() tangerineFormSession: TangerineFormSession = new TangerineFormSession();
  @Input() formId = '';
  // Latch onto the children Cards so we can listen for their events.
  @ContentChildren(TangerineFormCardComponent) tangerineFormCardChildren: QueryList<TangerineFormCardComponent>;


  constructor() {

  }

  ngOnInit() {
    console.log(this.formId);
    this.tangerineFormSession = new TangerineFormSession({
      formId: this.formId
    });
  }

  // TODO: Should be ngAfterContentInit?
  ngAfterViewInit() {
    console.log(this.formId);
    this.tangerineFormCardChildren.setDirty();
    this.tangerineFormCardChildren.forEach((tangerineFormCardComponent, index, cards) => {
      tangerineFormCardComponent.tangerineFormCard.model = this.tangerineFormSession.model;
      tangerineFormCardComponent.change.subscribe((tangerineFormCard) => {
        Object.assign(this.tangerineFormSession.model, tangerineFormCard.model);
      });
    });
  }

}
