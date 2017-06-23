import { ActionReducer, Action } from '@ngrx/store';
import { TangerineFormSession } from '../models/tangerine-form-session';

export const tangerineFormSessionReducer = (state = new TangerineFormSession, action: Action) => {
    // TODO: How to specify that newState should also be of TangerineFormSession type?
    // TODO: How do we make obvious that certain payloads are of certain types?

    switch (action.type) {
        case 'LOAD_FORM':
            return Object.assign({}, state, action.payload);
        case 'PAGE_UPDATE':
            const newState = Object.assign({}, state);
            Object.assign(newState.pages[state.pageIndex], {status: action.payload.status});
            Object.assign({}, newState.model, action.payload.model);
            return newState;
        case 'GO_TO_PAGE':
            return Object.assign({}, state, action.payload);
        case 'GO_TO_NEXT_PAGE':
            // Set page status to IN_PROGRESS
            if (state.pages.length === state.pageIndex + 1) {
                return Object.assign({}, state, { markedDone: true });
            } else {
                return Object.assign({}, state, {
                    pageIndex: state.pageIndex + 1
                });
            }
        case 'GO_TO_PREVIOUS_PAGE':
            // Set page status to IN_PROGRESS
            if (state.pageIndex === 0) {
                return Object.assign({}, state);
            } else {
                return Object.assign({}, state, {
                    pageIndex: state.pageIndex - 1
                });
            }

        default:
            console.log('Default hit');
            return state;


    }
};