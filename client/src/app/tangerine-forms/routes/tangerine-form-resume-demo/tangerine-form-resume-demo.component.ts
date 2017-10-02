import { Component, OnInit } from '@angular/core';
import { TangerineFormSession } from '../../models/tangerine-form-session';

@Component({
  selector: 'app-tangerine-form-resume-demo',
  templateUrl: './tangerine-form-resume-demo.component.html',
  styleUrls: ['./tangerine-form-resume-demo.component.css']
})
export class TangerineFormResumeDemoComponent implements OnInit {

  session: TangerineFormSession = new TangerineFormSession({
    '_id': 'bc82cf48-b394-3053-6759-c36dec144460',
    'formId': 'tangerine-form-demo',
    'model': {
      'variable1': 'i am resumed',
      'variable2': '',
      'favorite_fruit': 'Tangerine',
      'want_to_answer': 'yes',
    }
  });

  constructor() { }

  ngOnInit() {
  }

}
