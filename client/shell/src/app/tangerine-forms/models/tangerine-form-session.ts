import { TangerineFormCard } from './tangerine-form-card';
import { UUID } from 'angular2-uuid';

export class TangerineFormSession {
    _id: string = UUID.UUID();
    _rev?: any;
    formId = '';
    model = {};
    date: number = Date.now();
    status = 'IN_PROGRESS';
    constructor(session?) {
        if (session) {
            Object.assign(this, session);
        }
    }
}
