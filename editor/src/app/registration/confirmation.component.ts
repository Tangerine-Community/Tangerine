import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  //styleUrls: ['./verify.component.css']
})
export class ConfirmationComponent implements OnInit {
  user_id :string = localStorage.getItem('user_id');
  constructor() { }

  ngOnInit() {
      console.log('hello confirmation page');
  }

}