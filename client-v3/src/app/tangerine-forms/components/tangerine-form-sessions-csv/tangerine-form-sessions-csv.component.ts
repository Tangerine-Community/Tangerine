import { Component, Input, OnInit } from '@angular/core';
import { TangerineFormSessionsService } from '../../services/tangerine-form-sessions.service';
import { TangerineFormSession } from '../../models/tangerine-form-session';
import { WindowRef } from '../../../core/window-ref.service';
import * as Csv from 'csv-file-creator';
declare const Buffer;
@Component({
  selector: 'tangerine-form-sessions-csv',
  templateUrl: './tangerine-form-sessions-csv.component.html',
  styleUrls: ['./tangerine-form-sessions-csv.component.css']
})
export class TangerineFormSessionsCsvComponent implements OnInit {

  @Input() formId: string;
  @Input() link: string;
  sessions: Array<TangerineFormSession> = [];
  service: TangerineFormSessionsService;
  status = 'click to prepare csv';

  window: any;
  constructor(service: TangerineFormSessionsService, windowRef: WindowRef) {
    this.window = windowRef.nativeWindow;
    this.service = service;
  }

  async ngOnInit() {
  }

  async do() {
    if (this.status === 'click to prepare csv') {
      this.status = 'getting all form sessions';
      setTimeout(async () => {
        // @TODO: Instead of getting all, get one at a time and append to the blob
        // so we don't end up creating a big javascript array in memory.
        this.sessions = await this.service.getAll(this.formId);
        this.status = 'download csv';
      }, 2000);
    }
    else {
      this.downloadCsv();
    }
  }

  downloadCsv() {
    // TODO: Flatten all sessions.
    const flatSessions = [];
    this.sessions.forEach((session) => {
      flatSessions.push(this.flatten(session));
    });
    // Get unique keys.
    let keys = [];
    flatSessions.forEach((session) => {
      keys = keys.concat(Object.keys(session).filter(function (item) {
        return keys.indexOf(item) < 0;
      }));
    });
    const rows = [keys];
    flatSessions.forEach((session) => {
      const row = [];
      keys.forEach((key) => {
        row.push(session[key]);
      });
      rows.push(row);
    });
    this.generateCSV(this.formId + '.csv', rows);
  }

  // Flatten a deep object.
  // From https://gist.github.com/penguinboy/762197#gistcomment-2130571
  flatten(object: object, separator = '.'): object {
    const isValidObject = (value: {}): boolean => {
        if (!value) {
            return false;
        }

        const isArray = Array.isArray(value);
        const isBuffer = Buffer.isBuffer(value);
        const isΟbject = Object.prototype.toString.call(value) === '[object Object]';
        const hasKeys = !!Object.keys(value).length;

        return !isArray && !isBuffer && isΟbject && hasKeys;
    };

    const walker = (child: {}, path: Array<string> = []): Object => {
        return Object.assign({}, ...Object.keys(child).map(key => isValidObject(child[key])
            ? walker(child[key], path.concat([key]))
            : { [path.concat([key]).join(separator)]: child[key] })
        );
    };

    return Object.assign({}, walker(object));
  }

  generateCSV(filename, rows) {
    const csvRows = [];
    let blob = new Blob([], {type: 'application/csv;charset=utf-8;' });
    for (const row of rows) {
      blob = new Blob([blob, rows.join(',') + '\n'], { type: 'application/csv;charset=utf-8;' });
    }
    console.log('creating element');
    const element = this.window.document.createElement('a');
    element.setAttribute('href', URL.createObjectURL(blob));
    element.setAttribute('download', filename);
    console.log('appending to DOM');
    element.style.display = 'none';
    this.window.document.body.appendChild(element);
    console.log('Triggering download.');
    element.click();
    console.log('Cleaning up.');
    this.window.document.body.removeChild(element);
  }
}
