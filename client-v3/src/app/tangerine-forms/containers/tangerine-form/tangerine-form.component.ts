import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Store, provideStore } from '@ngrx/store';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { TangerineFormPage } from '../../models/tangerine-form-page';
import { TangerineFormSession } from '../../models/tangerine-form-session';



@Component({
  selector: 'tangerine-form',
  templateUrl: './tangerine-form.component.html',
  styleUrls: ['./tangerine-form.component.css']
})
export class TangerineFormComponent implements OnInit {

  private _tangerineFormPage: TangerineFormPage = new TangerineFormPage();
  form: FormGroup;
  // Insert session.
  @Input() tangerineFormSession: any;
  // Local copy of state.
  _tangerineFormSession: any;

  constructor(fb: FormBuilder, private store: Store<any>) {
    // Subrcribe to the store so we can receive updates when we are on a new page.
    store.select('tangerineFormSession')
      .subscribe((tangerineFormSession: TangerineFormSession) => {
        // Don't assign until the form is initialized.
        if (tangerineFormSession.hasOwnProperty('sections') && tangerineFormSession.sections.length > 0) {
          this._tangerineFormPage = tangerineFormSession
                                        .sections[tangerineFormSession.sectionIndex]
                                        .pages[tangerineFormSession.pageIndex];
        }
      });
    // Instantiate a Reactive Angular Form.
    this.form = fb.group({});
  }

   ngOnInit() {
     this.store.dispatch({type: 'LOAD_FORM', payload: this.tangerineFormSession});
  }

}
