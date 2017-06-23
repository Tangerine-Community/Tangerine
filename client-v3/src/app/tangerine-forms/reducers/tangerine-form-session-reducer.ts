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
            const page = newState.sections[state.sectionIndex].pages[state.pageIndex];
            page.model = action.payload.model;
            page.status = action.payload.status;
            newState.sections[state.sectionIndex].pages[state.pageIndex] = page;
            // newState.model = Object.assign({}, newState.model, action.payload.model);
            return newState;
        case 'GO_TO_PAGE':
            return Object.assign({}, state, action.payload);
        case 'GO_TO_NEXT_PAGE':
            // If we're on the last page, increment the sectionIndex, else increment pageIndex.
            if (state.sections[state.sectionIndex].pages.length === state.pageIndex + 1) {
                // If we're on the last section, mark done else increment the sectionIndex.
                if (state.sections.length === state.sectionIndex + 1) {
                    return Object.assign({}, state, { markedDone: true });
                } else {
                    return Object.assign({}, state, {
                        sectionIndex: (state.sectionIndex + 1),
                        pageIndex: 0
                    });
                }
            } else {
                return Object.assign({}, state, {
                    sectionIndex: state.sectionIndex,
                    pageIndex: state.pageIndex + 1
                });

            }
        case 'GO_TO_PREVIOUS_PAGE':
            // If we're on the first page, decrement the sectionIndex, else decrement pageIndex.
            if (state.pageIndex === 0) {
                // If we're on the first section, do nothing.
                if (state.sectionIndex === 0) {
                    return Object.assign({}, state);
                } else {
                    return Object.assign({}, state, {
                        sectionIndex: (state.sectionIndex - 1),
                        pageIndex: 0
                    });
                }
            } else {
                return Object.assign({}, state, {
                    sectionIndex: state.sectionIndex,
                    pageIndex: state.pageIndex - 1
                });
            }

        default:
            console.log('Default hit');
            return state;


    }
};