FORM_OPEN = 'FORM_OPEN'
const formOpen = (response) => window.tangyFormStore.dispatch({ type: FORM_OPEN, response })
FORM_RESPONSE_COMPLETE = 'FORM_RESPONSE_COMPLETE'

// Items
FOCUS_ON_ITEM = 'FOCUS_ON_ITEM'
const focusOnItem = (itemId) => window.tangyFormStore.dispatch({ type: FOCUS_ON_ITEM, itemId })
ITEM_OPEN = 'ITEM_OPEN'
const itemOpen = (itemId) => window.tangyFormStore.dispatch({ type: ITEM_OPEN, itemId: itemId })
ITEM_CLOSE = 'ITEM_CLOSE' 
const itemClose = (itemId) => window.tangyFormStore.dispatch({ type: ITEM_CLOSE, itemId: itemId })
ITEM_DISABLE = 'ITEM_DISABLE'
const itemDisable = (itemId) => { 
    let state = window.tangyFormStore.getState()
    let item = state.items.find(item => itemId === item.id)
    if (!item.disabled) window.tangyFormStore.dispatch({ type: ITEM_DISABLE, itemId: itemId })
}
ITEM_ENABLE = 'ITEM_ENABLE'
const itemEnable = (itemId) => {
    let state = window.tangyFormStore.getState()
    let item = state.items.find(item => itemId === item.id)
    if (item.disabled) window.tangyFormStore.dispatch({ type: ITEM_ENABLE, itemId: itemId })
}

ITEMS_INVALID = 'ITEMS_INVALID'
ITEM_CLOSE_STUCK = 'ITEM_CLOSE_STUCK' 
ITEM_NEXT = 'ITEM_NEXT' 
ITEM_BACK = 'ITEM_BACK' 
ITEM_CLOSED = 'ITEM_CLOSED' 
ITEM_DISABLED = 'ITEM_DISABLED'
ITEM_ENABLED = 'ITEM_ENABLED'
ITEM_VALID = 'ITEM_VALID' 



// Inputs
INPUT_ADD = 'INPUT_ADD' 
INPUT_VALUE_CHANGE = 'INPUT_VALUE_CHANGE' 

INPUT_DISABLE = 'INPUT_DISABLE'
const inputDisable = (inputName) => window.tangyFormStore.dispatch({ type: INPUT_DISABLE, inputName: inputName })

INPUT_ENABLE = 'INPUT_ENABLE'
const inputEnable = (inputName) => window.tangyFormStore.dispatch({ type: INPUT_ENABLE, inputName: inputName })

INPUT_INVALID = 'INPUT_INVALID'
const inputInvalid = (inputName) => window.tangyFormStore.dispatch({ type: INPUT_INVALID, inputName: inputName })
INPUT_VALID = 'INPUT_VALID'
const inputValid = (inputName) => window.tangyFormStore.dispatch({ type: INPUT_VALID, inputName: inputName })

INPUT_HIDE = 'INPUT_HIDE'
const inputHide = (inputName) => {
    let state = window.tangyFormStore.getState()
    let input = state.inputs.find(input => inputName === input.name)
    if (input.hidden === false) window.tangyFormStore.dispatch({ type: INPUT_HIDE, inputName: inputName })
}
INPUT_SHOW = 'INPUT_SHOW'
const inputShow = (inputName) => { 
    let state = window.tangyFormStore.getState()
    let input = state.inputs.find(input => inputName === input.name)
    if (input.hidden === true) window.tangyFormStore.dispatch({ type: INPUT_SHOW, inputName: inputName })
}
// Navigation
NAVIGATE_TO_NEXT_ITEM = 'NAVIGATE_TO_NEXT_ITEM'
NAVIGATE_TO_PREVIOUS_ITEM = 'NAVIGATE_TO_PREVIOUS_ITEM'

// Tangy Timed
TANGY_TIMED_MODE_CHANGE = 'TANGY_TIMED_MODE_CHANGE'
const tangyTimedModeChange = (inputName, tangyTimedMode) => {
    window.tangyFormStore.dispatch({ type: TANGY_TIMED_MODE_CHANGE, inputName, tangyTimedMode })
}

TANGY_TIMED_TIME_SPENT = 'TANGY_TIMED_TIME_SPENT'
const tangyTimedTimeSpent = (inputName, timeSpent) => {
    window.tangyFormStore.dispatch({ type: TANGY_TIMED_TIME_SPENT, inputName, timeSpent })
}

TANGY_TIMED_LAST_ATTEMPTED = 'TANGY_TIMED_LAST_ATTEMPTED'
const tangyTimedLastAttempted = (inputName, lastAttempted) => {
    window.tangyFormStore.dispatch({ type: TANGY_TIMED_LAST_ATTEMPTED, inputName, lastAttempted })
}

TANGY_TIMED_INCREMENT = 'TANGY_TIMED_INCREMENT'
const tangyTimedIncrement = (inputName) => {
    window.tangyFormStore.dispatch({ type: TANGY_TIMED_INCREMENT, inputName, tangyTimedMode })
}
