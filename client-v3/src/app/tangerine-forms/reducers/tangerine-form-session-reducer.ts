import { ActionReducer, Action } from '@ngrx/store';
import { TangerineFormSession } from '../models/tangerine-form-session';

export function tangerineFormSessionReducer(state, action: Action) {
    console.log(action.type);
    switch (action.type) {
        case 'TANGERINE_FORM_SESSION_START':
            const newSession = new TangerineFormSession();
            newSession.formId = action.payload.formId;
            return Object.assign({}, newSession);
        case 'TANGERINE_FORM_SESSION_RESUME':
            return Object.assign({}, state, action.payload);
        case 'TANGERINE_FORM_SESSION_UPDATE':
            return Object.assign({}, state, action.payload);
        case 'TANGERINE_FORM_FORMLY_UPDATE':
            return Object.assign({}, state, {model: Object.assign({}, state.model, action.payload)});
        case 'TANGERINE_FORM_ELEMENT_UPDATE':
            const variable = {};
            const id = action.payload.element.id;
            const value = action.payload.element.value;
            // Get real ID, remove formly additions to the ID.
            /* Formly's use of forms is too strange to support.
            if (id.indexOf('formly_') === 0) {
                id = id.substr(9, id.length);
                id = id.substr(id.indexOf('_') + 1, id.length);
                id = id.substr(0, id.length - 2);
                if (action.payload.element.type === 'radio') {
                  value = action.payload.element.labels[1].innerText.trim();
                }
            }
            */
            if (action.payload.element.type === 'checkbox') {
               variable[id] = action.payload.element.checked;
            } else {
                variable[id] = value;
            }
            return Object.assign({}, state, {model: Object.assign({}, state.model, variable)});
        default:
            return state;

    }
};
