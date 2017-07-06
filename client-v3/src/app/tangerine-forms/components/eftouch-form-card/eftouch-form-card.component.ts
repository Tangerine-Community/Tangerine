import {Component, ElementRef, OnInit} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {TangerineBaseCardComponent} from "../../models/tangerine-base-card";
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'eftouch-form-card',
  templateUrl: './eftouch-form-card.component.html',
  styleUrls: ['./eftouch-form-card.component.css'],
  animations: [
    trigger('cardStatus', [
      state('INVALID', style({
        backgroundColor: '#FFF',
        transform: 'scale(1.0)'
      })),
      state('VALID',   style({
        backgroundColor: '#afd29a',
        transform: 'scale(1.03)'
      })),
      transition('INVALID => VALID', animate('100ms ease-in')),
      transition('VALID => INVALID', animate('100ms ease-out'))
    ])
  ]
})

export class EftouchFormCardComponent extends TangerineBaseCardComponent implements OnInit {

  constructor(fb: FormBuilder, el: ElementRef) {
    super(fb, el);
  }

}
