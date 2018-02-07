/* jshint esversion: 6 */

const FORM_OPEN = 'FORM_OPEN'
const formOpen = (response) => window.tangyFormStore.dispatch({ type: FORM_OPEN, response })
const FORM_RESPONSE_COMPLETE = 'FORM_RESPONSE_COMPLETE'

// Items
const FOCUS_ON_ITEM = 'FOCUS_ON_ITEM'
const focusOnItem = (itemId) => window.tangyFormStore.dispatch({ type: FOCUS_ON_ITEM, itemId })
const ITEM_OPEN = 'ITEM_OPEN'
const itemOpen = (itemId) => window.tangyFormStore.dispatch({ type: ITEM_OPEN, itemId: itemId })
const ITEM_CLOSE = 'ITEM_CLOSE'
const itemClose = (itemId) => window.tangyFormStore.dispatch({ type: ITEM_CLOSE, itemId: itemId })
const ITEM_DISABLE = 'ITEM_DISABLE'
const itemDisable = (itemId) => { 
    let state = window.tangyFormStore.getState()
    let item = state.items.find(item => itemId === item.id)
    if (item && !item.disabled) window.tangyFormStore.dispatch({ type: ITEM_DISABLE, itemId: itemId })
}
const ITEM_ENABLE = 'ITEM_ENABLE'
const itemEnable = (itemId) => {
    let state = window.tangyFormStore.getState()
    let item = state.items.find(item => itemId === item.id)
    if (item && item.disabled) window.tangyFormStore.dispatch({ type: ITEM_ENABLE, itemId: itemId })
}

const ITEMS_INVALID = 'ITEMS_INVALID'
const ITEM_CLOSE_STUCK = 'ITEM_CLOSE_STUCK'
const ITEM_NEXT = 'ITEM_NEXT'
const ITEM_BACK = 'ITEM_BACK'
const ITEM_CLOSED = 'ITEM_CLOSED'
const ITEM_DISABLED = 'ITEM_DISABLED'
const ITEM_ENABLED = 'ITEM_ENABLED'
const ITEM_VALID = 'ITEM_VALID'



// Inputs
const INPUT_ADD = 'INPUT_ADD'
const INPUT_VALUE_CHANGE = 'INPUT_VALUE_CHANGE'

const INPUT_DISABLE = 'INPUT_DISABLE'
const inputDisable = (inputName) => window.tangyFormStore.dispatch({ type: INPUT_DISABLE, inputName: inputName })

const INPUT_ENABLE = 'INPUT_ENABLE'
const inputEnable = (inputName) => window.tangyFormStore.dispatch({ type: INPUT_ENABLE, inputName: inputName })

const INPUT_INVALID = 'INPUT_INVALID'
const inputInvalid = (inputName) => window.tangyFormStore.dispatch({ type: INPUT_INVALID, inputName: inputName })
const INPUT_VALID = 'INPUT_VALID'
const inputValid = (inputName) => window.tangyFormStore.dispatch({ type: INPUT_VALID, inputName: inputName })

const INPUT_HIDE = 'INPUT_HIDE'
const inputHide = (inputName) => {
    let state = window.tangyFormStore.getState()
    let input = state.inputs.find(input => inputName === input.name)
    if (input && input.hidden === false) window.tangyFormStore.dispatch({ type: INPUT_HIDE, inputName: inputName })
}
const INPUT_SHOW = 'INPUT_SHOW'
const inputShow = (inputName) => { 
    let state = window.tangyFormStore.getState()
    let input = state.inputs.find(input => inputName === input.name)
    if (input && input.hidden === true) window.tangyFormStore.dispatch({ type: INPUT_SHOW, inputName: inputName })
}
const COMPLETE_FAB_SHOW = 'COMPLETE_FAB_SHOW'
const completeFabShow = () => { 
    let state = window.tangyFormStore.getState()
    if (state.form.hideCompleteFab) window.tangyFormStore.dispatch({ type: COMPLETE_FAB_SHOW })
}
const COMPLETE_FAB_HIDE = 'COMPLETE_FAB_HIDE'
const completeFabHide = () => { 
    let state = window.tangyFormStore.getState()
    if (!state.form.hideCompleteFab) window.tangyFormStore.dispatch({ type: COMPLETE_FAB_HIDE })
}
// Navigation
const NAVIGATE_TO_NEXT_ITEM = 'NAVIGATE_TO_NEXT_ITEM'
const NAVIGATE_TO_PREVIOUS_ITEM = 'NAVIGATE_TO_PREVIOUS_ITEM'

// Tangy Timed
const TANGY_TIMED_MODE_CHANGE = 'TANGY_TIMED_MODE_CHANGE'
const tangyTimedModeChange = (inputName, tangyTimedMode) => {
    window.tangyFormStore.dispatch({ type: TANGY_TIMED_MODE_CHANGE, inputName, tangyTimedMode })
}

const TANGY_TIMED_TIME_SPENT = 'TANGY_TIMED_TIME_SPENT'
const tangyTimedTimeSpent = (inputName, timeSpent) => {
    window.tangyFormStore.dispatch({ type: TANGY_TIMED_TIME_SPENT, inputName, timeSpent })
}

const TANGY_TIMED_LAST_ATTEMPTED = 'TANGY_TIMED_LAST_ATTEMPTED'
const tangyTimedLastAttempted = (inputName, lastAttempted) => {
    window.tangyFormStore.dispatch({ type: TANGY_TIMED_LAST_ATTEMPTED, inputName, lastAttempted })
}

const TANGY_TIMED_INCREMENT = 'TANGY_TIMED_INCREMENT'
const tangyTimedIncrement = (inputName) => {
    window.tangyFormStore.dispatch({ type: TANGY_TIMED_INCREMENT, inputName, tangyTimedMode })
}

export {FORM_OPEN, formOpen, FORM_RESPONSE_COMPLETE, FOCUS_ON_ITEM, focusOnItem, ITEM_OPEN, itemOpen, ITEM_CLOSE, itemClose,
  ITEM_DISABLE, itemDisable, ITEM_ENABLE, itemEnable, ITEMS_INVALID, ITEM_CLOSE_STUCK, ITEM_NEXT,
  ITEM_BACK,ITEM_CLOSED,ITEM_DISABLED, inputDisable, ITEM_ENABLED, inputEnable, ITEM_VALID, inputInvalid, INPUT_ADD,
  INPUT_VALUE_CHANGE, INPUT_DISABLE, INPUT_ENABLE, INPUT_INVALID, INPUT_VALID, INPUT_HIDE, inputHide, INPUT_SHOW, inputShow,
  NAVIGATE_TO_NEXT_ITEM, NAVIGATE_TO_PREVIOUS_ITEM, TANGY_TIMED_MODE_CHANGE, tangyTimedModeChange, 
  completeFabHide, COMPLETE_FAB_HIDE, completeFabShow, COMPLETE_FAB_SHOW, TANGY_TIMED_TIME_SPENT,
  tangyTimedTimeSpent, TANGY_TIMED_LAST_ATTEMPTED, tangyTimedLastAttempted, TANGY_TIMED_INCREMENT, tangyTimedIncrement}
