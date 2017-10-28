
const initialState = {
  formId: '',
  collection: 'TangyFormResponse',
  focusItemId: 'item_1',
  startDate: (new Date()).toLocaleString(),
  items: [],
  inputs: [],
  count: 0
}

function tangyFormReducer(state = initialState, action) {
  switch(action.type) {

    case FORM_OPEN:
      return Object.assign({}, state, {items: [...action.items]})

    case ITEM_OPEN:
      return Object.assign({}, state, {items: state.items.map((item) => {
        if (item.id == action.itemId) {
          return Object.assign({}, item, {open: true})
        }
        return item
      })})

    case ITEM_CLOSE:
      return Object.assign({}, state, {items: state.items.map((item) => {
        if (item.id == action.itemId) {
          return Object.assign({}, item, {open: false, stuck: false})
        }
        return item
      })})

    case ITEM_CLOSE_STUCK:
      return Object.assign({}, state, {items: state.items.map((item) => {
        if (item.id == action.itemId) {
          return Object.assign({}, item, {open: true, stuck: true})
        }
        return item
      })})


    case ITEM_DISABLE:
    break

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
    case INPUT_HIDE:
    break
    case NAVIGATE_TO_NEXT_ITEM:
    break
    case NAVIGATE_TO_PREVIOUS_ITEM:
    break
    default: 
      return state
  }
  return state


}
/*
function tangyFormReducer(state = initialState, action) {
  return {
    items: tangyFormItemReducer(state.items, action)
  }

}

function tangyFormItemReducer(state = [], action) {
  switch(action.type) {

    case FORM_OPEN:
      return [...action.items]

    case ITEM_OPEN:
      return state.map((item) => {
        if (item.id == action.itemId) {
          return Object.assign({}, item, {open: true})
        }
        return item
      })

    case ITEM_CLOSE:
      return state.map((item) => {
        if (item.id == action.itemId) {
          return Object.assign({}, item, {open: false})
        }
        return item
      })

    case ITEM_DISABLE:
    break
    case INPUT_VALUE_CHANGE:
      newState = Object.assign({}, state)
      newState.inputs[action.inputName] = action.inputValue 
    break
    case INPUT_DISABLE:
    break
    case INPUT_HIDE:
    break
    case NAVIGATE_TO_NEXT_ITEM:
    break
    case NAVIGATE_TO_PREVIOUS_ITEM:
    break
    default: 
      return state
  }


}
*/

