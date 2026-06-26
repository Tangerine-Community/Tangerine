import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-custom-app',
    templateUrl: './custom-app.component.html',
    styleUrls: ['./custom-app.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CustomAppComponent implements OnInit {

  @ViewChild('container', {static: true}) container: ElementRef
  constructor(
    private http:HttpClient
  ) { }

  async ngOnInit() {
    const index = await this.http.get('./assets/index.html', {responseType: 'text'}).toPromise()
    this.container.nativeElement.innerHTML = index
  }

}
