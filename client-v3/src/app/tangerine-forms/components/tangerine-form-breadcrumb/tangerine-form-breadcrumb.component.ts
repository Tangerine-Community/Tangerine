import { Component, OnInit } from '@angular/core';
import { Store, provideStore } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { TangerineFormSession } from '../../models/tangerine-form-session';

@Component({
  selector: 'tangerine-form-breadcrumb',
  templateUrl: './tangerine-form-breadcrumb.component.html',
  styleUrls: ['./tangerine-form-breadcrumb.component.css']
})
export class TangerineFormBreadcrumbComponent implements OnInit {

  _tangerineFormSession: TangerineFormSession;

  constructor(private store: Store<any>) {
    store.select('tangerineFormSession')
      .subscribe((tangerineFormSession: TangerineFormSession) => {
        this._tangerineFormSession = tangerineFormSession;
      });
  }

  ngOnInit() {
  }

}
