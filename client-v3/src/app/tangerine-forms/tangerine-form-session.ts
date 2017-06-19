import { EventEmitter } from '@angular/core';
import { TangerineForm } from './tangerine-form';
import { TangerineFormLog } from './tangerine-form-log';
export class TangerineFormSession {
  _id = '';
  _rev = '';
  form: TangerineForm;
  cards = {};
  cardOrder = [];
  model: object = {};
  log: Array <TangerineFormLog> = [];
  private _bookmark = '';
  bookmarkChange: EventEmitter<Object> = new EventEmitter();
  constructor(sessionObject: any = {}) {
    // Required to pass this in.
    if (!this.formId && this.form) {
      this.pages = sessionObject.form.objectsByPath;
      this.pageOrder = sessionObject.form.pathsByIndex;
      this.formId = sessionObject._id;
    }
    if (!this.formId) {
      // TODO Should throw an error.
    }
    if (sessionObject.hasOwnProperty('_id')) {
      this._id = 'session1';
    } else {
      // TODO: Generate UUID.
    }
    if (sessionObject.hasOwnProperty('_rev')) {
      this._rev = sessionObject._rev;
    }
    if (sessionObject.hasOwnProperty('variables')) {
      this.variables = sessionObject.variables;
    }
    if (sessionObject.hasOwnProperty('log')) {
      this.log = sessionObject.log;
    }
    if (sessionObject.hasOwnProperty('bookmarkl')) {
      this.bookmark = sessionObject.bookmark;
    }
  }
  set bookmark(path) {
    this._bookmark = path;
    let index = this.pageOrder.indexOf[path];
    index++;
    // Right here is one of the big points.
    while (this.pages[this.pageOrder[index]].type !== 'item' && this.pages[this.pageOrder[index]].status !== 'skip') {
      index++;
    }
    this.nextPath = this.session.pageOrder[index];
    this.bookmarkChange.emit();
  }
  get bookmark() {
    return _bookmark;
  }
};
