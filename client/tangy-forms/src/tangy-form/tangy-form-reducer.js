
// Probably never used, tangy-form will set the form with a TangyFormResponseModel.
const initialState = {
  _id: 'form-1',
  formId: '',
  collection: 'TangyFormResponse',
  startDate: (new Date()).toLocaleString(),
  items: [],
  inputs: []
}

function calculateFocusTargets(state) {
  let tmp = {}
  let newState = Object.assign({}, state)
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
  return newState
}


function tangyFormReducer(state = initialState, action) {
  var items
  var currentIndex
  var newState
  var tmp = {}
  switch(action.type) {

    case FORM_OPEN:
      tmp.response = Object.assign({}, action.response)
      return Object.assign({}, tmp.response)

      /*
    case FORM_ADD_ITEMS:
      tmp.items = (state.items.length === 0) ? action.items : state.items
      tmp.openIndex = tmp.items.findIndex(item => (item.open))
      if (tmp.openIndex === -1) tmp.items[0].open = true
      return Object.assign({}, state, {
        items: tmp.items
      })
      */

    case ITEM_OPEN:
      newState = Object.assign({}, state)
      // Find the current index of the item opening.
      newState.focusIndex = newState.items.findIndex(item => (item.id === action.itemId))
      newState = calculateFocusTargets(newState)
      if (state.hasOwnProperty('linear-mode')) {
        // Apply focus.
        newState.items.forEach((item, i) => {
          if (i === newState.focusIndex) {
            item.open = true
          } else {
            item.open = false
          }
        }) 
        return newState
      } else {
        return Object.assign({}, newState, {items: state.items.map((item) => {
          if (item.id == action.itemId) {
            return Object.assign({}, item, {open: true})
          }
          return item
        })})
      }
      break


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
      newState = Object.assign({}, state, {
        items: state.items.map((item) => {
          if (item.id == action.itemId) {
            return Object.assign({}, item, {disabled: false})
          }
          return item
        })
      })
      return calculateFocusTargets(newState)

    case ITEM_DISABLE:
      newState = Object.assign({}, state, {
        items: state.items.map((item) => {
          if (item.id == action.itemId) {
            return Object.assign({}, item, {disabled: true})
          }
          return item
        })
      })
      return calculateFocusTargets(newState)

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
