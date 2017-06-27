import { Component, OnInit } from '@angular/core';
import { safeLoad } from 'js-yaml';

@Component({
  selector: 'app-tangerine-form-card-demo',
  templateUrl: './tangerine-form-card-demo.component.html',
  styleUrls: ['./tangerine-form-card-demo.component.css']
})
export class TangerineFormCardDemoComponent implements OnInit {

  tangerineFormCardExample = safeLoad(`
    id: 'card4'
    fields:
        - type: 'input'
          key: 'variable1'
          templateOptions: 
            required: true
            label: 'Variable 1'
            type: 'text'
        - type: 'input'
          key: 'variable2'
          templateOptions: 
            required: true
            label: 'Variable 2'
            type: 'text'
  `);


  constructor() { }

  ngOnInit() {
  }

  onChange(tangerineFormCard) {
    console.log(tangerineFormCard);
  }

  onSubmit(tangerineFormCard) {
    console.log(tangerineFormCard);
  }


}
