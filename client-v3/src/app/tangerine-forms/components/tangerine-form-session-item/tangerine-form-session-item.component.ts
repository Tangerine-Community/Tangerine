import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Store, provideStore } from '@ngrx/store';
import { TangerineFormSession } from '../../models/tangerine-form-session';
import { TangerineFormSessionsService } from '../../services/tangerine-form-sessions.service';

@Component({
  selector: 'tangerine-form-session-item',
  templateUrl: './tangerine-form-session-item.component.html',
  styleUrls: ['./tangerine-form-session-item.component.css']
})
export class TangerineFormSessionItemComponent implements OnInit {

  @Input() session: TangerineFormSession;
  @Input() link: string;

  constructor(private store: Store<any>, private service: TangerineFormSessionsService, private router: Router) {
  }

  ngOnInit() {
  }

  resumeSession() {
    this.store.dispatch({type: 'TANGERINE_FORM_SESSION_RESUME', payload: this.session});
    this.router.navigate([this.link]);
  }

}
