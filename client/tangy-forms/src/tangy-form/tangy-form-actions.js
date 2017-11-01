FORM_SESSION_RESUME = 'FORM_SESSION_RESUME'
FORM_ADD_ITEMS = 'FORM_ADD_ITEMS'

// Items
FOCUS_ON_ITEM = 'FOCUS_ON_ITEM'
const focusOnItem = (focusIndex) => window.tangyFormStore.dispatch({ type: FOCUS_ON_ITEM, focusIndex })
ITEM_OPEN = 'ITEM_OPEN'
const itemOpen = (itemId) => window.tangyFormStore.dispatch({ type: ITEM_OPEN, itemId: itemId })
ITEM_CLOSE = 'ITEM_CLOSE' 
const itemClose = (itemId) => window.tangyFormStore.dispatch({ type: ITEM_CLOSE, itemId: itemId })
ITEM_DISABLE = 'ITEM_DISABLE'
const itemDisable = (itemId) => window.tangyFormStore.dispatch({ type: ITEM_DISABLE, itemId: itemId })
ITEM_ENABLE = 'ITEM_ENABLE'
const itemEnable = (itemId) => window.tangyFormStore.dispatch({ type: ITEM_ENABLE, itemId: itemId })

ITEMS_INVALID = 'ITEMS_INVALID'
ITEM_CLOSE_STUCK = 'ITEM_CLOSE_STUCK' 
ITEM_CLOSED = 'ITEM_CLOSED' 
ITEM_DISABLED = 'ITEM_DISABLED'
ITEM_ENABLED = 'ITEM_ENABLED'
ITEM_VALID = 'ITEM_VALID' 
ITEM_OPENED = 'ITEM_OPENED'



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