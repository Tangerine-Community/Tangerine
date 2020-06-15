import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {UserService} from "../../../shared/_services/user.service";

@Component({
  selector: 'app-case-reports',
  templateUrl: './case-reports.component.html',
  styleUrls: ['./case-reports.component.css']
})
export class CaseReportsComponent implements OnInit {

  @ViewChild('container', {static: true}) container: ElementRef

  constructor(
    private http:HttpClient,
    private userService: UserService,
  ) { }

  async ngOnInit() {
    window['TangyDb'] = await this.userService.getUserDatabase(this.userService.getCurrentUser())
    const reportsHtml = await this.http.get('./assets/reports.html', {responseType: 'text'}).toPromise()
    this.container.nativeElement.innerHTML = reportsHtml
  }

}
