import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChildren, ElementRef, QueryList, ContentChildren } from '@angular/core';
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
  @ContentChildren(TangerineFormCardComponent) tangerineFormCardChildren: QueryList<TangerineFormCardComponent>;
  // Config may come through the element.
  private internalEl: any;

  // Pass the store in so we can subscribe to tangerineFormSession.
  constructor(private store: Store<any>, el: ElementRef) {
    this.internalEl = el;
  }

  ngOnInit() {

  }

  // TODO: Should be ngAfterContentInit?
  ngAfterViewInit() {
    this.tangerineFormCardChildren.setDirty();
    console.log(this.tangerineFormCardChildren);
    this.tangerineFormCardChildren.forEach((tangerineFormCardComponent, index, cards) => {
      tangerineFormCardComponent.tangerineFormCard.model = this.tangerineFormModel;
      tangerineFormCardComponent.change.subscribe((tangerineFormCard) => {
        Object.assign(this.tangerineFormModel, tangerineFormCard.model);
      });
    });
  }

}
