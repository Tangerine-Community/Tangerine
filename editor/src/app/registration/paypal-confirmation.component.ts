import { Component, OnInit } from '@angular/core';

@Component({
  //selector: 'app-confirmation',
  templateUrl: './paypal-confirmation.component.html',
  //styleUrls: ['./verify.component.css']
})
export class PaypalConfirmationComponent implements OnInit {
  user_id :string = localStorage.getItem('user_id');
  constructor() { }

  ngOnInit() {
      console.log('hello confirmation page');
  }

}