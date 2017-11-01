FORM_SESSION_RESUME = 'FORM_SESSION_RESUME'
FORM_OPEN = 'FORM_OPEN'
// Items
ITEM_OPEN = 'ITEM_OPEN'
ITEM_OPENED = 'ITEM_OPENED'
ITEM_CLOSE = 'ITEM_CLOSE' 
ITEM_CLOSE_STUCK = 'ITEM_CLOSE_STUCK' 
ITEM_VALID = 'ITEM_VALID' 
ITEM_CLOSED = 'ITEM_CLOSED' 
ITEM_DISABLE = 'ITEM_DISABLE'
const itemDisable = (itemId) => window.tangyFormStore.dispatch({ type: ITEM_DISABLE, itemId: itemId })
ITEM_ENABLE = 'ITEM_ENABLE'
const itemEnable = (itemId) => window.tangyFormStore.dispatch({ type: ITEM_ENABLE, itemId: itemId })


// Inputs
INPUT_ADDED = 'INPUT_ADDED' 
INPUT_VALUE_CHANGE = 'INPUT_VALUE_CHANGE' 
INPUT_DISABLE = 'INPUT_DISABLE'
INPUT_HIDE = 'INPUT_HIDE'
const inputHide = (inputName) => window.tangyFormStore.dispatch({ type: INPUT_HIDE, inputName: inputName })
INPUT_SHOW = 'INPUT_SHOW'
const inputShow = (inputName) => window.tangyFormStore.dispatch({ type: INPUT_SHOW, inputName: inputName })

// Navigation
NAVIGATE_TO_NEXT_ITEM = 'NAVIGATE_TO_NEXT_ITEM'
NAVIGATE_TO_PREVIOUS_ITEM = 'NAVIGATE_TO_PREVIOUS_ITEM'