import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    //selector: 'app-verify',
    templateUrl: './verify.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class VerifyComponent implements OnInit {

  constructor() { }

  ngOnInit() {
      console.log('hello verify page');
  }

}