import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store, provideStore } from '@ngrx/store';
import { TangerineFormSession } from '../../models/tangerine-form-session';
import { TangerineFormSessionsService } from '../../services/tangerine-form-sessions.service';

@Component({
  selector: 'tangerine-form-links',
  templateUrl: './tangerine-form-links.component.html',
  styleUrls: ['./tangerine-form-links.component.css']
})
export class TangerineFormLinksComponent implements OnInit {

  @Input() formId: string;
  @Input() link: string;
  showSessions = false;
  toggleSessionText = 'show sessions';
  toggleSessions() {
    if (this.showSessions) {
      this.showSessions = false;
      this.toggleSessionText = 'show sessions';
    } else {
      this.showSessions = true;
      this.toggleSessionText = 'hide sessions';
    }
  }



  constructor(private store: Store<any>, private service: TangerineFormSessionsService, private router: Router) { }
  ngOnInit() {
  }

  newSession() {
    this.store.dispatch({type: 'TANGERINE_FORM_SESSION_START', payload: {formId: this.formId}});
    this.router.navigate([this.link]);
  }

}
