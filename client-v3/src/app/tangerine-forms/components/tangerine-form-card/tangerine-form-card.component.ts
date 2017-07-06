import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { safeLoad } from 'js-yaml';
import { TangerineFormCard } from '../../models/tangerine-form-card';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import {TangerineBaseCardComponent} from "../../models/tangerine-base-card";


@Component({
  selector: 'tangerine-form-card',
  templateUrl: './tangerine-form-card.component.html',
  styleUrls: ['./tangerine-form-card.component.css'],
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
export class TangerineFormCardComponent extends TangerineBaseCardComponent implements OnInit {

  constructor(fb: FormBuilder, el: ElementRef) {
    super(fb, el);
  }

}
