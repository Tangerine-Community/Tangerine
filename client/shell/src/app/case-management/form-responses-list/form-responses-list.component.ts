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
import { CaseManagementService } from '../_services/case-management.service';

@Component({
  selector: 'app-form-responses-list',
  templateUrl: './form-responses-list.component.html',
  styleUrls: ['./form-responses-list.component.css']
})
export class FormResponsesListComponent {
  userDatabase;
  formList;
  dataSource;
  displayedColumns = ['formTitle', 'startDatetime', 'class', 'subject', 'stream', 'action'];

  constructor(
    private userService: UserService,
    private caseManagementService: CaseManagementService
  ) {
    this.initialize();
  }

  async initialize() {
    this.userDatabase = await this.userService.getUserDatabase();
    this.formList = await this.caseManagementService.getFormList();
    this.dataSource = new FormResponsesListDataSource(this.userDatabase, this.formList);
  }

}

export class FormResponsesListDataSource extends DataSource<any> {
  DB;
  constructor(private userDatabase: string, private formList) {
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
          if (item.doc.form.id !== 'user-profile') {
            const index = this.formList.findIndex(c => c.id === item.doc.form.id);
            const doc = {
              formId: item.doc.form.id,
              formTitle: item.doc.formTitle,
              startDatetime: item.doc.startDatetime,
              _id: item.doc._id,
              formIndex: index,
              formSrc: index > -1 ? this.formList[index].src : ''
            };
            flattenedData.push(doc);
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
