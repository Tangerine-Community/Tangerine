import { ActionReducer, Action } from '@ngrx/store';
import { TangerineFormSession } from '../models/tangerine-form-session';


export const tangerineFormSessionReducer = (state = new TangerineFormSession, action: Action) => {
    switch (action.type) {
        case 'LOAD_FORM':
            // TODO
            return state;
        case 'PAGE_UPDATE':
            const newState = Object.assign({}, state);
            newState.sections[state.sectionIndex][state.pageIndex].model = action.payload.model;
            newState.sections[state.sectionIndex][state.pageIndex].status = action.payload.status;
            return newState;
        case 'GO_TO_PAGE':
            return Object.assign({}, state, {bookmark: action.payload});
        case 'GO_TO_NEXT_PAGE':
            if (state.sections[state.sectionIndex].pages.length === state.pageIndex) {
                return Object.assign({}, state, {
                    sectionIndex: (state.sectionIndex + 1),
                    pageIndex: 0
                });
            } else {
                return Object.assign({}, state, {
                    sectionIndex: state.sectionIndex,
                    pageIndex: state.pageIndex + 1
                });

            }
        case 'HELLO':
            console.log('hello from tangerine-session reducer :)');
            return {foo: 'bar'};

        default:
            console.log('Default hit');
            return state;


    }
};