import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-attendance-nav',
  template: `
    <div>
      <button mat-stroked-button [matMenuTriggerFor]="attMenu">
        <mat-icon>post_add</mat-icon>
        <span>  {{'Attendance'|translate}}</span>
      </button>
      <mat-menu #attMenu="matMenu">
        <button mat-menu-item [routerLink]="['/attendance-dashboard/']"
                [queryParams]='classRegistrationParams'
                aria-label="icon button with a task list icon">
          <mat-icon>summarize</mat-icon>
          <span>{{'Dashboard'|translate}}</span>
        </button>
        <button mat-menu-item [routerLink]="['/attendance-check/']"
                [queryParams]='classRegistrationParams'
                aria-label="icon button with a task list icon">
          <mat-icon>checklist</mat-icon>
          <span>{{'Check Attendance'|translate}}</span>
        </button>
        <button mat-menu-item [routerLink]="['/attendance-scores/']"
                [queryParams]='classRegistrationParams'
                aria-label="icon button with a task list icon">
          <mat-icon>scoreboard</mat-icon>
          <span>{{'Record test scores'|translate}}</span>
        </button>
      </mat-menu>
    </div>
    
  `,
  styleUrls: ['./attendance-dashboard/attendance-dashboard.component.css']
})

export class AttendanceNavComponent implements OnInit {

  classRegistrationParams = {
    formId: 'class-registration'
  };
  constructor() { }

  ngOnInit() {
  }

}