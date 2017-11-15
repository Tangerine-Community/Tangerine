import { CaseManagementService } from '../_services/case-management.service';
import { Observable } from 'rxjs/Rx';
import { Component, Injectable, OnInit } from '@angular/core';
import { DataSource } from '@angular/cdk';
import 'rxjs/add/observable/of';


@Component({
  selector: 'app-form-responses-list',
  templateUrl: './form-responses-list.component.html',
  styleUrls: ['./form-responses-list.component.css']
})
export class FormResponsesListComponent implements OnInit {
  displayedColumns = ['formName', 'date', 'class', 'subject', 'stream', 'action'];
  dataSource = new FormResponsesListDataSource();
  ngOnInit() {
  }
}

@Injectable()
export class FormResponsesListDataSource extends DataSource<any>{
  data = [
    { date: new Date(), class: '1', subject: 'English', stream: 'Stream 1' },
    { date: new Date(), class: '2', subject: 'Math', stream: 'Stream 2' },
    { date: new Date(), class: '1', subject: 'Kiswahili', stream: 'Stream 2' },
    { date: new Date(), class: '3', subject: 'Math', stream: 'Stream 3' },
    { date: new Date(), class: '2', subject: 'English', stream: 'Stream 1' },
    { date: new Date(), class: '1', subject: 'Math', stream: 'Stream 2' }
  ];
  connect(): Observable<any[]> {
    return Observable.of(this.data);
  }

  disconnect() {

  }
}
