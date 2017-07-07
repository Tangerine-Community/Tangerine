import {Component, ElementRef, forwardRef, OnInit} from "@angular/core";
import {FormBuilder} from "@angular/forms";
import {TangerineBaseCardComponent} from "../../models/tangerine-base-card";
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'eftouch-form-card',
  templateUrl: './eftouch-form-card.component.html',
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
  ],
  // We use providers to link this class' superclass, TangerineBaseCardComponent, to its child EftouchFormCardComponent
  // This enables the ContentChildren query in TangerineFormComponent to find its children.
  // See https://github.com/Tangerine-Community/Tangerine/issues/369 for more information
  providers: [{provide: TangerineBaseCardComponent, useExisting: forwardRef(() => EftouchFormCardComponent)}]
})

export class EftouchFormCardComponent extends TangerineBaseCardComponent implements OnInit {

  constructor(fb: FormBuilder, el: ElementRef) {
    super(fb, el);
  }

}
