import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TangerineFormCard } from '../../models/tangerine-form-card';
import { TangerineFormCarousel } from '../../models/tangerine-form-carousel';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-tangerine-form-carousel',
  templateUrl: './tangerine-form-carousel.component.html',
  styleUrls: ['./tangerine-form-carousel.component.css'],
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
    ]),
    trigger('swipeAction', [
      state('SWIPE_RIGHT', style({
        backgroundColor: '#afd29a',
        transform: 'scale(1.01)'
      })),
      state('SWIPE_LEFT',   style({
        backgroundColor: '#000',
        transform: 'scale(1.01)'
      })),
      state('CENTERED',   style({
        backgroundColor: '#FFF',
        transform: 'scale(1)'
      })),
      transition('SWIPE_LEFT => CENTERED', animate('100ms ease-in')),
      transition('CENTERED => SWIPE_LEFT', animate('100ms ease-out')),
      transition('SWIPE_RIGHT => CENTERED', animate('100ms ease-in')),
      transition('CENTERED => SWIPE_RIGHT', animate('100ms ease-out'))
    ])
  ]
})
export class TangerineFormCarouselComponent implements OnInit {

  @Input() cards: Array<TangerineFormCard>;
  @Output() cardUpdate = new EventEmitter();

  _hasNextCard = true;
  _hasPreviousCard = true;
  _swipe = 'CENTERED';

  constructor() { }

  ngOnInit() {
    /*
    store.select('tangerineFormCarousel')
      .subscribe((tangerineFormCarousel: TangerineFormCarousel) => {
        this.status = tangerineFormSession.status;
        console.log(tangerineFormSession.swipe);
        this.swipe = tangerineFormSession.swipe;
        setTimeout(() => {
          this.swipe = 'CENTERED';
          console.log(this.swipe);

        });
        // Don't assign until the form is initialized.
        if (tangerineFormSession.hasOwnProperty('pages') && tangerineFormSession.pages.length > 0) {
          this._tangerineFormPage = tangerineFormSession.pages[tangerineFormSession.pageIndex];
        }
      });
      */

  }

  onCardUpdate (card) {
    this.cardUpdate.emit(card);
  }

  previous () {

  }

  next () {

  }

  done() {

  }

}

const TangerineFormCarouselStore = {

};

const TangerineFormCarouselReducer = function(state, action) {

};