import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-confirmation',
    templateUrl: './confirmation.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ConfirmationComponent implements OnInit {
  user_id :string = localStorage.getItem('user_id');
  constructor() { }

  ngOnInit() {
      console.log('hello confirmation page');
  }

}