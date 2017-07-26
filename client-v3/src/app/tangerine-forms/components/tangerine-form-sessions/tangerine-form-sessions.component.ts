import { Component, Input, OnInit } from '@angular/core';
import { TangerineFormSessionsService } from '../../services/tangerine-form-sessions.service';
import { TangerineFormSession } from '../../models/tangerine-form-session';
import * as Csv from 'csv-file-creator';
declare const Buffer;
import { WindowRef } from '../../../core/window-ref.service';

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
  window: any;

  constructor(windowRef: WindowRef, service: TangerineFormSessionsService) {
    this.service = service;
    this.window = windowRef.nativeWindow;
  }

  async ngOnInit() {
    this.sessions = await this.service.getAll(this.formId);
  }

  async downloadCsv() {
    const archive = new this.window.DatArchive('' + this.window.location)
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
    Csv(this.formId + '.csv', rows);
    await archive.writeFile(this.formId + '.csv', JSON.stringify(rows), 'utf8')
    await archive.commit()
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

}
