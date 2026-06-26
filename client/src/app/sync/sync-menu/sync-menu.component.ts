import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-sync-menu',
    templateUrl: './sync-menu.component.html',
    styleUrls: ['./sync-menu.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SyncMenuComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
