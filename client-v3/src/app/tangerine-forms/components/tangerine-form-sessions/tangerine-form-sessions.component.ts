import { Component, Input, OnInit } from '@angular/core';
import { TangerineFormSessionsService } from '../../services/tangerine-form-sessions.service';
import { TangerineFormSession } from '../../models/tangerine-form-session';

@Component({
  selector: 'tangerine-form-sessions',
  templateUrl: './tangerine-form-sessions.component.html',
  styleUrls: ['./tangerine-form-sessions.component.css']
})
export class TangerineFormSessionsComponent implements OnInit {

  @Input() formId: string;
  @Input() link: string;
  sessions: Array<TangerineFormSession> = [];
  service: TangerineFormSessionsService;

  constructor(service: TangerineFormSessionsService) {
    this.service = service;
  }

  async ngOnInit() {
    this.sessions = await this.service.getAll(this.formId);
  }

}
