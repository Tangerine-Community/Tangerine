import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { GroupDataService } from './group-data-service.service';
import { TangerineFormSession } from '../../tangerine-forms/models/tangerine-form-session';
import { Store } from '@ngrx/store';
import { TangerineFormSessionsService } from '../../tangerine-forms/services/tangerine-form-sessions.service';
import { TangerineFormCardComponent } from '../../tangerine-forms/components/tangerine-form-card/tangerine-form-card.component';
import { TangerineGroupSessionsEffects } from '../../tangerine-forms/effects/tangerine-group-sessions-effects';

@Component({
  selector: 'group-manager',
  templateUrl: './group-manager.component.html',
  styleUrls: ['./group-manager.component.css'],
  providers: [GroupDataService]
})
export class GroupManagerComponent implements OnInit {

  // IO.
  // @Input() groupModel:Group;
  // @Input() result: GroupResult;
  result: any;
  @Input() session: TangerineFormSession;

  // @Input() session: TangerineFormSession = new TangerineFormSession({
  //   '_id': 'bc82cf48-b394-3053-6759-c36dec144460',
  //   'formId': 'tangerine-group-demo',
  //   'model': {
  //     'name': 'Rambo'
  //   }
  // });
  @Input() formId = 'group';

  @ViewChild(TangerineFormCardComponent) child: TangerineFormCardComponent;
  private _effects: TangerineGroupSessionsEffects;
  private subscription: any;

  // Set the store to a local store property.
  constructor(private store: Store<any>, private service: TangerineFormSessionsService) {
    // TODO: In the future, it would be nice if Components did not have to be in charge of activating Effects.
    //       Perhaps we could make effects reducers that misbehave.
    this._effects = new TangerineGroupSessionsEffects(store, service);
  }

  ngOnDestroy() {
    this._effects.subscription.unsubscribe();
    this.subscription.unsubscribe();
  }

  onSubmit(tangerineFormCard) {
    console.log(tangerineFormCard.model);
    // Object.assign(this.result.variables, tangerineFormCard.model);
    // this.save(this.result.variables)
  }

  ngOnInit() {
  }

  ngAfterViewInit() {

    // Subscribe Tangerine Form Session.
    this.subscription = this.store.select('tangerineFormSession')
      .subscribe((tangerineFormSession: TangerineFormSession) => {

        // No Session or the session doesn't match this form? Call home for one and this will come back around.
        if (!tangerineFormSession || tangerineFormSession.formId !== this.formId) {
          this.store.dispatch({ type: 'TANGERINE_FORM_SESSION_START', payload: { formId: this.formId } });
        }
        // We now have a session for this Component, do things only once.
        // cek: removed else if
        else if (!this.session) {
          // Spread the Session around.
          this.session = tangerineFormSession;
          this.child.tangerineFormCard.model = Object.assign({}, this.session.model);
          // Subscribe to all of the cards change events.
          // this.tangerineFormCardChildren.forEach((tangerineFormCardComponent, index, cards) => {
          if (this.child.tangerineFormCard.showSubmitButton === false) {
            this.child.change.subscribe((tangerineFormCard) => {
              // Protect from an infinite loop because of how Formly works.
              const potentialModel = Object.assign({}, this.session.model, tangerineFormCard.model);
              if (JSON.stringify(potentialModel) !== JSON.stringify(this.session.model)) {
                this.store.dispatch({
                  type: 'TANGERINE_FORM_SESSION_MODEL_UPDATE',
                  payload: tangerineFormCard.model
                });
              };
            });
            // });
          } else {
            this.child.submit.subscribe((tangerineFormCard) => {
              // Protect from an infinite loop because of how Formly works.
              const potentialModel = Object.assign({}, this.session.model, tangerineFormCard.model);
              if (JSON.stringify(potentialModel) !== JSON.stringify(this.session.model)) {
                this.store.dispatch({
                  type: 'TANGERINE_FORM_SESSION_MODEL_UPDATE',
                  payload: tangerineFormCard.model
                });
              };
            });
          }
        }
        // We have an update to the session.
        else {
          this.session = tangerineFormSession;
          this.child.tangerineFormCard.model = Object.assign({}, this.session.model);
        };

      });

  }

}
