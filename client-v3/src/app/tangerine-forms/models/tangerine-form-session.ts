import { TangerineFormCard } from './tangerine-form-card';
import { UUID } from 'angular2-uuid';

export class TangerineFormSession {
    _info: any;
    constructor() {
        this._info = {id: UUID.UUID()};
    }
}
