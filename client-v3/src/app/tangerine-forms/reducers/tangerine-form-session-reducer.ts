import { ActionReducer, Action } from '@ngrx/store';
import { TangerineFormSession } from '../models/tangerine-form-session';

export const tangerineFormSessionReducer = (state = new TangerineFormSession, action: Action) => {

    switch (action.type) {
        case 'TANGERINE_FORM_SESSION_START':
            return Object.assign({}, state, action.payload);
        case 'TANGERINE_FORM_CARD_CHANGE':
            const newState = Object.assign({}, state);
            return Object.assign({}, state, action.payload);
        default:
            console.log('Default hit');
            return state;

    }
};
