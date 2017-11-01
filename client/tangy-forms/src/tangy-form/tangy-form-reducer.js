
// Probably never used, tangy-form will set the form with a TangyFormResponseModel.
const initialState = {
  _id: 'form-1',
  formId: '',
  collection: 'TangyFormResponse',
  startDate: (new Date()).toLocaleString(),
  items: [],
  inputs: []
}

function tangyFormReducer(state = initialState, action) {
  var items
  var currentIndex
  var newState
  var tmp = {}
  switch(action.type) {

    case FORM_SESSION_RESUME:
      return Object.assign({}, action.session)

    case FORM_ADD_ITEMS:
      return Object.assign({}, state, {
        items: (state.items.length === 0) ? action.items : state.items
      })

    case FOCUS_ON_ITEM:
      newState = Object.assign({}, state)
      // Find the current index of the item opening.
      newState.focusIndex = action.focusIndex 
      // Find next.
      newState.nextFocusIndex = state.items.findIndex((item, i) =>  (i > newState.focusIndex && !item.hasOwnProperty('disabled')))
      // Find previous focus index using reversed items and focus index.
      newState.items.reverse()
      tmp.focusIndexReversed = newState.items.length - newState.focusIndex - 1
      newState.previousFocusIndex = newState.items.findIndex((item, i) =>  (i > tmp.focusIndexReversed && !item.hasOwnProperty('disabled')))
      if (newState.previousFocusIndex !== -1) {
        // Unreverse the the found index.
        newState.previousFocusIndex = newState.items.length - newState.previousFocusIndex - 1
      }
      // Unreverse items.
      newState.items.reverse()
      newState.items.forEach((item, i) => {
        if (i === newState.focusIndex) {
          item.open = true
        } else {
          item.open = false
        }
      }) 
      return newState 

    case ITEM_OPEN:
      return Object.assign({}, state, {items: state.items.map((item) => {
        if (item.id == action.itemId) {
          return Object.assign({}, item, {open: true})
        }
        return item
      })})


    // Move into ITEM_ENABLE / ITEM_DISABLE?
    case ITEM_ENABLED:
    case ITEM_DISABLED:
       newState = Object.assign({}, state)
      // Recalculate focus indexes.

    case ITEM_VALID:
      items = state.items.map((item) => {
          if (state.focusId == item.id) {
            return Object.assign({}, item, {open: true})
          }
          if (item.id == action.itemId) {
            return Object.assign({}, item, {valid: true})
          }
          return item
        })
      return Object.assign({}, state, {
        progress: ( ( ( items.filter((i) => i.valid).length ) / items.length ) * 100 ),
        items: items 
      })

    case ITEM_CLOSE:
      return Object.assign({}, state, {
        progress: ( ( ( state.items.filter((i) => i.valid).length ) / state.items.length ) * 100 ),
        items: state.items.map((item) => {
          if (item.id == action.itemId) {
            return Object.assign({}, item, {open: false, valid: true})
          }
          return item
        })
      })

    case ITEM_CLOSE_STUCK:
      return Object.assign({}, state, {
        focusId: action.itemId,
        progress: ( ( ( state.items.filter((i) => i.valid == true).length + 1 ) / state.items.length ) * 100 ),
        items: state.items.map((item) => {
          if (item.id == action.itemId) {
            return Object.assign({}, item, {open: true, valid: false})
          }
          return item
        })
      })

    case ITEM_ENABLE:
      return Object.assign({}, state, {
        items: state.items.map((item) => {
          if (item.id == action.itemId) {
            return Object.assign({}, item, {disabled: false})
          }
          return item
        })
      })

    case ITEM_DISABLE:
      return Object.assign({}, state, {
        items: state.items.map((item) => {
          if (item.id == action.itemId) {
            return Object.assign({}, item, {disabled: true})
          }
          return item
        })
      })

    case INPUT_ADDED: 
      // If this input does not yet
      if (state.inputs.findIndex((input) => input.name === action.attributes.name) === -1) {
        return Object.assign({}, state, {inputs: [...state.inputs, action.attributes]})
      }
      break

    case INPUT_VALUE_CHANGE:
      return Object.assign({}, state, {inputs: state.inputs.map((input) => {
        if (input.name == action.inputName) {
          return Object.assign({}, input, {value: action.inputValue})
        }
        return input 
      })})
    break
    case INPUT_DISABLE:
    break

    case INPUT_SHOW:
      return Object.assign({}, state, { inputs: state.inputs.map((input) => {
        if (input.name == action.inputName) {
          return Object.assign({}, input, {hidden: false})
        }
        return input
      })})

    case INPUT_HIDE:
      return Object.assign({}, state, { inputs: state.inputs.map((input) => {
        if (input.name == action.inputName) {
          return Object.assign({}, input, {hidden: true})
        }
        return input
      })})

    case NAVIGATE_TO_NEXT_ITEM:
      return Object.assign({}, state, { 
        items: state.items.map((item) => {
          item.open = (state.items[state.nextItemIndex].id === item.id) ? true : false 
          return item
        })
      })

    case NAVIGATE_TO_PREVIOUS_ITEM:
      return Object.assign({}, state, { 
        items: state.items.map((item) => {
          item.open = (state.items[state.previousItemIndex].id === item.id) ? true : false 
          return item
        })
      })


    default: 
      return state
  }
  return state


}
