import { HttpClient } from '@angular/common/http';
import {Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';

@Component({
  selector: 'app-case-reports',
  templateUrl: './case-reports.component.html',
  styleUrls: ['./case-reports.component.css']
})
export class CaseReportsComponent implements OnInit {

  @ViewChild('container', {static: true}) container: ElementRef
  reportsHtml
  constructor(
    private http:HttpClient,
    private ref: ChangeDetectorRef,
  ) {
    ref.detach();
  }

  async ngOnInit() {
    this.reportsHtml = await this.http.get('./assets/reports.html', {responseType: 'text'}).toPromise()
    let reportsJs = ''
    try {
      reportsJs = await this.http.get('./assets/reports.js', {responseType: 'text'}).toPromise()
    } catch (e) {
      console.error(e)
    }
    this.ref.detectChanges();
    eval(reportsJs)
  }

}
