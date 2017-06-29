import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TangerineFormSession } from '../../models/tangerine-form-session';

@Component({
  selector: 'tangerine-form-session',
  templateUrl: './tangerine-form-session.component.html',
  styleUrls: ['./tangerine-form-session.component.css']
})
export class TangerineFormSessionComponent implements OnInit {

  @Input() session: TangerineFormSession;
  @Output() change = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
