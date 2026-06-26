import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-admin-configuration',
    templateUrl: './admin-configuration.component.html',
    styleUrls: ['./admin-configuration.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AdminConfigurationComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  
}
