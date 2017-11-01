import { Observable } from 'rxjs/Rx';
import { Component, OnInit } from '@angular/core';
import { DataSource } from '@angular/cdk';
import 'rxjs/add/observable/of';
@Component({
  selector: 'app-form-responses-list',
  templateUrl: './form-responses-list.component.html',
  styleUrls: ['./form-responses-list.component.css']
})


export class FormResponsesListComponent implements OnInit {
  dataSource;
  displayedColumns = ['date', 'class', 'subject', 'stream'];
  constructor() { }

  ngOnInit() {
    this.dataSource = new FormDataSource();
  }


}

export interface FormResponse {
  date?: Date;
  class: string;
  subject: string;
  stream?: string;
}

const data: FormResponse[] = [{
  class: '1',
  subject: 'English'
}];
export class FormDataSource extends DataSource<any> {
  connect(): Observable<FormResponse[]> {
    return Observable.of(data);
  }

  disconnect() {

  }
}