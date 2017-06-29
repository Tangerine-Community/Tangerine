import { TangerineFormCard } from './tangerine-form-card';
import { UUID } from 'angular2-uuid';

export class TangerineFormSession {
    _id: string = UUID.UUID();
    formId = '';
    model = {};
    constructor(session?) {
        if (session) {
            Object.assign(this, session);
        }
    }
}
