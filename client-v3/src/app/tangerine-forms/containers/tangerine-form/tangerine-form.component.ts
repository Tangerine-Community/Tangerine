import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Store, provideStore } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';



@Component({
  selector: 'tangerine-form',
  templateUrl: './tangerine-form.component.html',
  styleUrls: ['./tangerine-form.component.css']
})
export class TangerineFormComponent implements OnInit {

  // Insert session.
  @Input() tangerineFormSession: any;
  // Local copy of state.
  _tangerineFormSession: any;

  constructor(private store: Store<any>) {
    // this.tangerineFormSession = store.select('tangerineFormSession');
    store.select('tangerineFormSession')
      .subscribe(tangerineFormSession => {
        this._tangerineFormSession = tangerineFormSession;
      });
  }

   ngOnInit() {
     this.store.dispatch({type: 'LOAD_FORM', payload: this.tangerineFormSession});
  }

  nextPageClick() {
    this.store.dispatch({ type: 'GO_TO_NEXT_PAGE' });
  }

  previousPageClick() {
    this.store.dispatch({ type: 'GO_TO_PREVIOUS_PAGE' });
  }

}
