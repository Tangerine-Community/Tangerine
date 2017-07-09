
import { TangerineFormSessionsService } from '../services/tangerine-form-sessions.service';
import { Store, provideStore } from '@ngrx/store';
import { TangerineFormSession } from '../models/tangerine-form-session';

export class TangerineFormSessionsEffects {
  // Wether or not saving is currently taking place.
  saving = false;
  // Wether or not there is an item queued to save.
  queued = false;
  // The last item queued for saving.
  queue: any;
  constructor(private store: Store<any>, private service: TangerineFormSessionsService) {
    this.store.select('tangerineFormSession')
      .subscribe((tangerineFormSession: TangerineFormSession) => {
        if (tangerineFormSession && tangerineFormSession.hasOwnProperty('_id')) {
            this.save(tangerineFormSession);
        }
      });
  }

  async save(session) {
    // Prevent parallel saves...
    if (this.saving === false) {
        this.saving = true;
        session = await this.service.forceSave(session);
        // ... but save the last item queued for saving.
        if (this.queued === true) {
            session = await this.service.forceSave(this.queue);
            this.queued = false;
        }
        this.saving = false;
    }
    else {
        this.queue = session;
        this.queued = true;
    }

    // TODO: Causes infinite loops. The store will never know about new revisions. May never.
    // this.store.dispatch({type: 'TANGERINE_FORM_SESSION_UPDATE', payload: session});
  }

}
