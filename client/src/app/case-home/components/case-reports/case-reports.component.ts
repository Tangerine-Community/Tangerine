import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-case-reports',
  templateUrl: './case-reports.component.html',
  styleUrls: ['./case-reports.component.css']
})
export class CaseReportsComponent implements OnInit {

  @ViewChild('container', {static: true}) container: ElementRef

  constructor(
    private http:HttpClient
  ) { }

  async ngOnInit() {
    const reportsHtml = await this.http.get('./assets/reports.html', {responseType: 'text'}).toPromise()
    this.container.nativeElement.innerHTML = reportsHtml
  }

}
