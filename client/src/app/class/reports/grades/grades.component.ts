import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-grades',
    templateUrl: './grades.component.html',
    styleUrls: ['./grades.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class GradesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
