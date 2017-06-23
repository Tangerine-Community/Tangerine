import { Component, OnInit } from '@angular/core';
import { Store, provideStore } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'tangerine-form-pager',
  templateUrl: './tangerine-form-pager.component.html',
  styleUrls: ['./tangerine-form-pager.component.css']
})
export class TangerineFormPagerComponent implements OnInit {

  _tangerineFormSession: any;

  constructor(private store: Store<any>) {
    store.select('tangerineFormSession')
      .subscribe(tangerineFormSession => {
        this._tangerineFormSession = tangerineFormSession;
      });
  }

  ngOnInit() {
  }

  nextPageClick() {
    this.store.dispatch({ type: 'GO_TO_NEXT_PAGE' });
  }

  previousPageClick() {
    this.store.dispatch({ type: 'GO_TO_PREVIOUS_PAGE' });
  }

}
