import { ActionReducer, Action } from '@ngrx/store';
import { TangerineFormSession } from '../models/tangerine-form-session';

export const tangerineFormSessionReducer = (state = new TangerineFormSession, action: Action) => {
    // TODO: How to specify that newState should also be of TangerineFormSession type?
    // TODO: How do we make obvious that certain payloads are of certain types?

    switch (action.type) {
        case 'FORM_LOAD':
            return Object.assign({}, state, action.payload);
        case 'FORM_UPDATE':
            const newState = Object.assign({}, state);
            Object.assign(newState.pages[state.pageIndex], {status: action.payload.status});
            newState.model = Object.assign({}, action.payload.model);
            // console.log(newState.model);
            newState.pages.forEach((page, index, pages) => {
                let skip = false;
                const model = Object.assign({}, newState.model);
                skip = false;
                eval(page.logic);
                pages[index].skip = skip;
            });
            return newState;
        case 'GO_TO_PAGE':
            return Object.assign({}, state, action.payload);
        case 'GO_TO_NEXT_PAGE':
            // Set page status to IN_PROGRESS
            if (state.pages.length === state.pageIndex + 1) {
                return Object.assign({}, state, { markedDone: true });
            } else {
                let newPageIndex = state.pageIndex + 1;
                while (state.pages[newPageIndex].skip === true) {
                    newPageIndex++;
                }
                return Object.assign({}, state, {
                    pageIndex: newPageIndex
                });
            }
        case 'GO_TO_PREVIOUS_PAGE':
            // Set page status to IN_PROGRESS
            if (state.pageIndex === 0) {
                return Object.assign({}, state);
            } else {
                let newPageIndex = state.pageIndex - 1;
                while (state.pages[newPageIndex].skip === true) {
                    newPageIndex--;
                }
                return Object.assign({}, state, {
                    pageIndex: newPageIndex
                });
            }

        default:
            console.log('Default hit');
            return state;


    }
};