import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-tangy-loading',
    templateUrl: './tangy-loading.component.html',
    styleUrls: ['./tangy-loading.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class TangyLoadingComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
