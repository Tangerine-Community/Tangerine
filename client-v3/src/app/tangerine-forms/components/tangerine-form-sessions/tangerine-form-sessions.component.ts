import { Component, Input, OnInit } from '@angular/core';
import { TangerineFormSessionsService } from '../../services/tangerine-form-sessions.service';
import { TangerineFormSession } from '../../models/tangerine-form-session';
import * as Csv from 'csv-file-creator';

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

  downloadCsv() {
    // TODO: Flatten all sessions.
    // Get unique keys.
    let keys = [];
    this.sessions.forEach((session) => {
      keys = keys.concat(Object.keys(session.model).filter(function (item) {
        return keys.indexOf(item) < 0;
      }));
    });
    const rows = [keys];
    this.sessions.forEach((session) => {
      const row = [];
      keys.forEach((key) => {
        row.push(session.model[key]);
      });
      rows.push(row);
    });

    Csv(this.formId + '.csv', rows);
  }

}
