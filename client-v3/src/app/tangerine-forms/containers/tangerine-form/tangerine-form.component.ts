import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { TangerinePageComponent } from '../tangerine-page/tangerine-page.component';
// import { TangerineFormResult } from '../tangerine-form-result';
// import { TangerineForm } from '../tangerine-form';
// import { TangerineFormContext } from '../tangerine-form-context';
import { Store, provideStore } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

interface TangerineFormSessionState {
  id: 'resultId1';
  formId: 'form1';
  sectionIndex: 0;
  pageIndex: 0;
  markedDone: false;
  sections: [
    {
      status: 'UNSEEN'
      path: '/a'
      pages: [
        {
          status: 'VALID'
          fields: [
            {
              required: true,
              key: 'variable1',
              templateConfig: {
                type: 'text'
              }
            }
          ]
          model: {
            'variable1': '',
            'variable2': ''
          }
        }
      ]
    }
  ];
};

@Component({
  selector: 'tangerine-form',
  templateUrl: './tangerine-form.component.html',
  styleUrls: ['./tangerine-form.component.css']
})
export class TangerineFormComponent implements OnInit {

  // tangerineFormSession: Observable<TangerineFormSessionState>;
  // tangerineFormSession: TangerineFormSessionState;
 tangerineFormSession: any;

  constructor(private store: Store<any>) {
    // this.tangerineFormSession = store.select('tangerineFormSession');
    store.select('tangerineFormSession')
      .subscribe(tangerineFormSession => {
        this.tangerineFormSession = tangerineFormSession;
      });
  }

   ngOnInit() {
  }

  buttonClick() {
    console.log('hi');
    console.log(this.tangerineFormSession);
    this.store.dispatch({ type: 'HELLO' });
    console.log(this.tangerineFormSession);
  }
}
