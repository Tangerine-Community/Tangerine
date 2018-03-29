/* jshint esversion: 6 */

import {FORM_OPEN, FORM_RESPONSE_COMPLETE, FOCUS_ON_ITEM, ITEM_OPEN, ITEM_CLOSE, ITEM_DISABLE, ITEM_ENABLE, ITEMS_INVALID, ITEM_CLOSE_STUCK, ITEM_NEXT,
  ITEM_BACK, ITEM_CLOSED, ITEM_DISABLED, ITEM_ENABLED, ITEM_VALID, INPUT_ADD, INPUT_VALUE_CHANGE, INPUT_DISABLE, INPUT_ENABLE,
  INPUT_INVALID,  INPUT_VALID, INPUT_HIDE, INPUT_SHOW, NAVIGATE_TO_NEXT_ITEM, NAVIGATE_TO_PREVIOUS_ITEM, TANGY_TIMED_MODE_CHANGE,
  TANGY_TIMED_TIME_SPENT, TANGY_TIMED_LAST_ATTEMPTED, TANGY_TIMED_INCREMENT, COMPLETE_FAB_HIDE, COMPLETE_FAB_SHOW,} from './tangy-form-actions.js'// import './tangy-form-actions.js'


// Probably never used, tangy-form will set the form with a TangyFormResponseModel.
const initialState = {
  _id: 'form-1',
  formId: '',
  collection: 'TangyFormResponse',
  startDate: (new Date()).toLocaleString(),
  items: [],
  inputs: []
}

const tangyFormReducer = function (state = initialState, action) {
  var items
  var currentIndex
  var newState
  var tmp = {}
  switch(action.type) {

    case FORM_OPEN:
      // tmp.response = Object.assign({}, action.response)
      newState = Object.assign({}, action.response) 
      if (!newState.form.complete && !newState.items.find(item => item.open)) newState.items[0].open = true
      if (newState.form.hideClosedItems === true) newState.items.forEach(item => item.hidden = !item.open)
      if (newState.form.linearMode === true) newState.items.forEach(item => item.hideButtons = true)
      return newState

    case FORM_RESPONSE_COMPLETE:
      return Object.assign({}, state, {
        complete: true,
        form: Object.assign({}, state.form, {
          complete: true,
          linearMode: false,
          hideClosedItems: false
        }),
        items: state.items.map(item => {
          let props = {}
          // If the item has inputs, then it was opened and potentially touched so don't hide buttons
          // so that they may review what is inside.
          // Look at the inputs for the item, only show buttons if it does actually have input.
          if (item.disabled) {
            props.hidden = true
          } else {
            props.hidden = false
            props.open = false
            props.hideButtons = false
          }
          props.hideBackButton = true
          props.hideNextButton = true
          props.inputs = item.inputs.map(input => {
            if (input.tagName === 'TANGY-TIMED') {
              return Object.assign({}, input, {disabled: true, mode: 'TANGY_TIMED_MODE_DISABLED'})
            } else {
              return Object.assign({}, input, {disabled: true})
            }
          })
          if (item.feedback) {
            props.open = true
          }
          return Object.assign({}, item, props)
         return item
        }),
        inputs: state.inputs.map(input => Object.assign({}, input, {disabled: true}))
      })

    case 'SHOW_RESPONSE':
      return Object.assign({}, state, { 
        form: Object.assign({}, state.form, {
          tabIndex: 1,
          showResponse: true,
          showSummary: false
        }),
        items: state.items.map((item) => {
          if (item.summary) {
            return Object.assign({}, item, { hidden: true })
          } else {
            return Object.assign({}, item, { hidden: false })
          }
      })})
 
    case 'SHOW_SUMMARY':
      return Object.assign({}, state, {
        form: Object.assign({}, state.form, {
          tabIndex: 0,
          showResponse: false,
          showSummary: true 
        }),
        items: state.items.map((item) => {
          if (item.summary) {
            return Object.assign({}, item, { open: true, hidden: false })
          } else {
            return Object.assign({}, item, { hidden: true })
          }
      })})     

    case ITEM_OPEN:
      newState = Object.assign({}, state)
      // Find the current index of the item opening.
      newState.focusIndex = newState.items.findIndex(item => (item.id === action.itemId))
      return Object.assign({}, newState, {items: state.items.map((item) => {
        if (item.id == action.itemId) {
          return Object.assign({}, item, {open: true})
        }
        return item
      })})
      break


    case ITEM_CLOSE:
      tmp.itemIndex = state.items.findIndex(item => item.id === action.itemId)
      newState = Object.assign({}, state)

      // Mark open and closed.
      Object.assign(newState, {
        progress: ( ( ( state.items.filter((i) => i.valid).length ) / state.items.length ) * 100 ),
        items: state.items.map((item) => {
          if (item.id == action.itemId) {
            return Object.assign({}, item, {open: false, valid: true, hideButtons: false})
          }
          return Object.assign({}, item)
        })
      })
      // Calculate if there is next and previous item Ids.
      Object.assign(newState, calculateTargets(newState))
      return newState

    case ITEM_BACK:
    case ITEM_NEXT:
      tmp.itemIndex = state.items.findIndex(item => item.id === action.itemId)
      newState = Object.assign({}, state)
      // In case it next and previous hasn't been calculated yet.
      // @TODO: Do we need to do this??
      Object.assign(newState, calculateTargets(newState))
      // Mark open and closed.
      Object.assign(newState, {
        progress:  
          ( 
            state.items.filter((i) => i.valid).length
                                                      / 
                                                        state.items.filter(item => !item.disabled).length
                                                                                                          ) * 100,
        items: newState.items.map((item) => {
          let props = {}
          if (item.id == action.itemId) {
            props.open = false 
          }
          if (action.type === ITEM_BACK && newState.previousItemId === item.id) {
            props.open = true
          }
          if (action.type === ITEM_NEXT && newState.nextItemId === item.id) {
            props.open = true
          }
          if (newState.form.hideClosedItems === true && !props.open) {
            props.hidden = true
          } else {
            props.hidden = false
          }
          return Object.assign({}, item, props) 
        })
      })
      // Calculate if there is next and previous item Ids.
      Object.assign(newState, calculateTargets(newState))
      return newState



    case ITEM_ENABLE:
      newState = Object.assign({}, state, {
        items: state.items.map((item) => {
          if (item.id == action.itemId) {
            return Object.assign({}, item, {disabled: false})
          }
          return item
        })
      })
      return calculateTargets(newState)

    case 'ITEM_SAVE':
      newState = Object.assign({}, state, {
        items: state.items.map((item) => {
          if (item.id == action.item.id) {
            return Object.assign({}, item, action.item)
          }
          return item
        })
      })
      return newState

    case ITEM_DISABLE:
      newState = Object.assign({}, state, {
        items: state.items.map((item) => {
          if (item.id == action.itemId) {
            return Object.assign({}, item, {disabled: true})
          }
          return item
        })
      })
      return calculateTargets(newState)

    case COMPLETE_FAB_HIDE:
      return Object.assign({}, state, { 
        form: Object.assign(state.form, {
          hideCompleteFab: true 
        }) 
      })

    case COMPLETE_FAB_SHOW:
      return Object.assign({}, state, { 
        form: Object.assign(state.form, {
          hideCompleteFab: false
        }) 
      })

    default: 
      return state
  }
  return state


}
function itemsIncompleteCheck(state, inputName) {
  let items = [...state.items]
  // Find out if item is complete if all required elements are not incomplete.
  let incomplete = false
  // Find item index.
  let itemIndex = 0
  items.forEach((item, i) => {
    if (item.inputs.includes(inputName)) itemIndex = i 
  })
  // Find any incomplete or invalid item in item that are not disabled and not hidden.
  state.inputs.forEach(input => {
    if (state.items[itemIndex].inputs.includes(input.name)) {
      if (!input.disabled && !input.hidden && input.required) {
        if (input.incomplete || input.invalid) {
          incomplete = true 
        }
      }
    }
  })
  items[itemIndex].incomplete = incomplete 
  return items 
}

function calculateTargets(state) {
  let tmp = {}
  let newState = Object.assign({}, state)
  newState.focusIndex = newState.items.findIndex(item => item.open)
  newState.nextFocusIndex = state.items.findIndex((item, i) =>  (i > newState.focusIndex && (!item.hasOwnProperty('disabled') || item.disabled === false)))
  // Find previous focus index using reversed items and focus index.
  newState.items.reverse()
  tmp.focusIndexReversed = newState.items.length - newState.focusIndex - 1
  newState.previousFocusIndex = newState.items.findIndex((item, i) =>  (i > tmp.focusIndexReversed && (!item.hasOwnProperty('disabled') || item.disabled === false)))
  if (newState.previousFocusIndex !== -1) {
    // Unreverse the the found index.
    newState.previousFocusIndex = newState.items.length - newState.previousFocusIndex - 1
  }
  // Unreverse items.
  newState.items.reverse()
  if (newState.nextFocusIndex !== -1) {
    newState.nextItemId = newState.items[newState.nextFocusIndex].id
  } else {
    newState.nextItemId = undefined
  }

  if (newState.previousFocusIndex !== -1) {
    newState.previousItemId = newState.items[newState.previousFocusIndex].id
  } else {
    newState.previousItemId = undefined
  }

  return newState
}

export {tangyFormReducer, itemsIncompleteCheck, calculateTargets}
