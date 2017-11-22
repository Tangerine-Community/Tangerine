import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';

import { DataSource } from '@angular/cdk/table';
import { Component } from '@angular/core';
import PouchDB from 'pouchdb';
import { Observable } from 'rxjs/Rx';

import { UserService } from '../../core/auth/_services/user.service';

@Component({
  selector: 'app-form-responses-list',
  templateUrl: './form-responses-list.component.html',
  styleUrls: ['./form-responses-list.component.css']
})
export class FormResponsesListComponent {
  userDatabase;
  dataSource;
  displayedColumns = ['formTitle', 'startDatetime', 'class', 'subject', 'stream', 'action'];

  constructor(private userService: UserService) {
    this.initialize();
  }

  async initialize() {
    this.userDatabase = await this.userService.getUserDatabase();
    this.dataSource = new FormResponsesListDataSource(this.userDatabase);
  }

}

export class FormResponsesListDataSource extends DataSource<any> {
  DB;
  constructor(private userDatabase: string) {
    super();
    this.DB = new PouchDB(this.userDatabase);
  }


  async getListOfResponses() {
    const results = await this.DB.query('tangy-form/responsesByFormId', { include_docs: true });
    if (results.rows.length === 0) {
      return false;
    } else {
      return results.rows;
    }
  }
  connect(): Observable<any[]> {

    return Observable.merge()
      .startWith(null).switchMap(() => {
        return this.getListOfResponses();
      })
      .map(data => {
        const flattenedData = [];
        data.forEach(item => {
          if (item.doc.formId !== 'user-profile') {
            flattenedData.push({
              formId: item.doc.formId,
              formTitle: item.doc.formTitle,
              startDatetime: item.doc.startDatetime,
              responseId: item.doc.responseId,
              _id: item.doc._id
            });
          }
        });
        return flattenedData;
      })
      .map(data => {
        return data;
      }).catch(() => {
        console.error('Could Not Load Form Responses');
        return Observable.of(null);
      });
  }

  disconnect() {

  }
}
