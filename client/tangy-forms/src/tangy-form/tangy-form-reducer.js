
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

    case FORM_OPEN:
      // tmp.response = Object.assign({}, action.response)
      return Object.assign({}, action.response)

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
      // Validate.
      newState.inputs = state.inputs.map(input => {
        // Skip over if not in the item being closed.
        if (state.items[tmp.itemIndex].inputs.indexOf(input.name) === -1) {
          return Object.assign({}, input)
        }
        // Check to see if the item has value.
        let hasValue = false
        if (Array.isArray(input.value) && input.value.length > 0) hasValue = true
        if (typeof input.value === 'string' && input.value.length > 0) hasValue = true
        // Now check the validation.
        if (input.required === true 
            && !hasValue
            && input.hidden === false
            && input.disabled === false) {
            return Object.assign({}, input, {invalid: true})
        } else {
          return Object.assign({}, input)
        }
      })

      // Find blockers.
      tmp.foundInvalidInputs = false
      newState.inputs.forEach(input => {
        if (state.items[tmp.itemIndex].inputs.indexOf(input.name) !== -1 
            && input.disabled !== true
            && input.hidden !== true 
            && input.invalid === true) {
          tmp.foundInvalidInputs = true 
        }
      })
      // If there are invalid inputs, don't open, just return newState.
      if (tmp.foundInvalidInputs) return newState 

      // In case it next and previous hasn't been calculated yet.
      Object.assign(newState, calculateTargets(newState))

      // Mark open and closed.
      Object.assign(newState, {
        progress: ( ( ( state.items.filter((i) => i.valid).length ) / state.items.length ) * 100 ),
        items: state.items.map((item) => {
          if (item.id == action.itemId) {
            return Object.assign({}, item, {open: false, valid: true})
          }
          if (action.navigateBack && newState.previousItemId === item.id) {
            return Object.assign({}, item, {open: true})
          }
          if (action.navigateForward && newState.nextItemId === item.id) {
            return Object.assign({}, item, {open: true})
          }
          return Object.assign({}, item)
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
    
    /*
     * INPUT
     */

    case INPUT_ADD: 
      // If this input does not yet
      newState = Object.assign({}, state)
      tmp.itemIndex = state.items.findIndex(item => item.id === action.itemId)
      // Save input name reference to item.
      if (state.items[tmp.itemIndex].inputs.findIndex((input) => input.name === action.attributes.name) === -1) {
        newState.items[tmp.itemIndex].inputs = [...newState.items[tmp.itemIndex].inputs, action.attributes.name]
      }
      // Save input in inputs.
      if (state.inputs.findIndex((input) => input.name === action.attributes.name) === -1) {
        newState.inputs = [...newState.inputs, action.attributes]
      }
      return newState 

    case INPUT_VALUE_CHANGE:
      return Object.assign({}, state, {inputs: state.inputs.map((input) => {
        if (input.name == action.inputName) {
          return Object.assign({}, input, {value: action.inputValue, invalid: action.inputInvalid})
        }
        return input 
      })})
    break

    case INPUT_DISABLE:
      return Object.assign({}, state, { inputs: state.inputs.map((input) => {
        if (input.name == action.inputName) {
          return Object.assign({}, input, {disabled: true})
        }
        return input
      })})

    case INPUT_ENABLE:
      return Object.assign({}, state, { inputs: state.inputs.map((input) => {
        if (input.name == action.inputName) {
          return Object.assign({}, input, {disabled: false})
        }
        return input
      })})

    case INPUT_INVALID:
      return Object.assign({}, state, { inputs: state.inputs.map((input) => {
        if (input.name == action.inputName) {
          return Object.assign({}, input, {invalid: true})
        }
        return input
      })})

    case INPUT_VALID:
      return Object.assign({}, state, { inputs: state.inputs.map((input) => {
        if (input.name == action.inputName) {
          return Object.assign({}, input, {invalid: false})
        }
        return input
      })})

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
