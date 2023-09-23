import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-attendance-nav',
  template: `
    <div class="controls-wrapper">
      <div class="controls-one">
        <button mat-icon-button color="primary"
                [routerLink]="['/attendance-check/']"
                aria-label="icon button with a checklist icon">
          <mat-icon>checklist</mat-icon>
        </button>
      </div>
      <div class="controls-two">
        <button mat-icon-button color="primary"
                [routerLink]="['/attendance-scores/']"
                aria-label="icon button with a scoreboard icon">
          <mat-icon>scoreboard</mat-icon>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./attendance-dashboard/attendance-dashboard.component.css']
})

export class AttendanceNavComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}