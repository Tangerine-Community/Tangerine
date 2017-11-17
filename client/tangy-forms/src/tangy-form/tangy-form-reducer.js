
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
      newState = Object.assign({}, action.response) 
      if (!newState.items.find(item => item.open)) newState.items[0].open = true
      if (newState.form.hideClosedItems === true) newState.items.forEach(item => item.hidden = !item.open)
      if (newState.form.linearMode === true) newState.items.forEach(item => item.hideButtons = true)
      return newState

    case FORM_RESPONSE_COMPLETE:
      return Object.assign({}, state, {
        complete: true,
        form: Object.assign({}, state.form, {
          linearMode: false,
          hideClosedItems: false
        }),
        items: state.items.map(item => {
          let props = {}
          // If the item has inputs, then it was opened and potentially touched so don't hide buttons
          // so that they may review what is inside.
          // Look at the inputs for the item, only show buttons if it does actually have input.
          if (item.inputs.length === 0 || item.disabled) {
            props.hidden = true
          } else {
            props.hidden = false
            props.open = false
            props.hideButtons = false
          }
          return Object.assign({}, item, props)
        }),
        inputs: state.inputs.map(input => Object.assign({}, input, {disabled: true}))
      })

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
      /*
      newState.inputs = setIncompleteInputsToInvalidByItemIndex(state, tmp.itemIndex)

      // Look for invalid inputs.
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
      */

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
            props.valid = true
            props.hideButtons = false
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
      if (!state.items[tmp.itemIndex].hasOwnProperty('inputs')) newState.items[tmp.itemIndex].inputs = []
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
      newState = Object.assign({}, state, {inputs: state.inputs.map((input) => {
        if (input.name == action.inputName) {
          return Object.assign({}, input, {
            value: action.inputValue, 
            invalid: action.inputInvalid,
            incomplete: action.inputIncomplete
          })
        }
        return input 
      })})
      // Find out if item is complete if all required elements are not incomplete.
      let incomplete = false
      // Find item index.
      let itemIndex = 0
      newState.items.forEach((item, i) => {
        if (item.inputs.includes(action.inputName)) itemIndex = i 
      })
      // Find any incomplete or invalid item in item that are not disabled and not hidden.
      newState.inputs.forEach(input => {
        if (newState.items[itemIndex].inputs.includes(input.name)) {
          if (!input.disabled && !input.hidden && input.required) {
            if (input.incomplete || input.invalid) {
              incomplete = true 
            }
          }
        }
      })
      newState.items[itemIndex].incomplete = incomplete 
      return newState

    case INPUT_DISABLE:
      newState = Object.assign({}, state, { inputs: state.inputs.map((input) => {
        if (input.name == action.inputName) {
          return Object.assign({}, input, {disabled: true})
        }
        return input
      })})
      return Object.assign({}, newState, {
        items: itemsIncompleteCheck(newState, action.inputName)
      })

    case INPUT_ENABLE:
      newState = Object.assign({}, state, { inputs: state.inputs.map((input) => {
        if (input.name == action.inputName) {
          return Object.assign({}, input, {disabled: false})
        }
        return input
      })})
      return Object.assign({}, newState, {
        items: itemsIncompleteCheck(newState, action.inputName)
      })

    case INPUT_SHOW:
      newState = Object.assign({}, state, { inputs: state.inputs.map((input) => {
        if (input.name == action.inputName) {
          return Object.assign({}, input, {hidden: false})
        }
        return input
      })})
      return Object.assign({}, newState, {
        items: itemsIncompleteCheck(newState, action.inputName)
      })

    case INPUT_HIDE:
      newState = Object.assign({}, state, { inputs: state.inputs.map((input) => {
        if (input.name == action.inputName) {
          return Object.assign({}, input, {hidden: true})
        }
        return input
      })})
      return Object.assign({}, newState, {
        items: itemsIncompleteCheck(newState, action.inputName)
      })

    case TANGY_TIMED_MODE_CHANGE:
      return Object.assign({}, state, { inputs: state.inputs.map((input) => {
        if (input.name == action.inputName) {
          return Object.assign({}, input, {mode: action.tangyTimedMode})
        }
        return input
      })})

    case TANGY_TIMED_LAST_ATTEMPTED:
      return Object.assign({}, state, { inputs: state.inputs.map((input) => {
        if (input.name == action.inputName) {
          return Object.assign({}, input, {lastAttempted: action.lastAttempted})
        }
        return input
      })})

    case TANGY_TIMED_TIME_SPENT:
      return Object.assign({}, state, { inputs: state.inputs.map((input) => {
        if (input.name == action.inputName) {
          return Object.assign({}, input, {timeSpent: action.timeSpent})
        }
        return input
      })})




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

function validateItemInputs(state, itemIndex) {
  return state.inputs.map(input => {
    // Skip over if not in the item being closed.
    if (state.items[itemIndex].inputs.indexOf(input.name) === -1) {
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
