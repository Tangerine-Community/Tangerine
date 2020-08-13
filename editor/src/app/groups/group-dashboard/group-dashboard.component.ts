import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-group-dashboard',
  templateUrl: './group-dashboard.component.html',
  styleUrls: ['./group-dashboard.component.css']
})
export class GroupDashboardComponent implements OnInit {

  @ViewChild('container', {static: true}) container: ElementRef
  constructor(
    private http:HttpClient
  ) { }

  async ngOnInit() {
    const index = await this.http.get('./files/editor/index.html', {responseType: 'text'}).toPromise()
    this.container.nativeElement.innerHTML = index
  }

}
