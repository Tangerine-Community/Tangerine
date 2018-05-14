import {
  FORM_OPEN, formOpen, FORM_RESPONSE_COMPLETE, FOCUS_ON_ITEM, focusOnItem, ITEM_OPEN, itemOpen, ITEM_CLOSE, itemClose,
  ITEM_DISABLE, itemDisable, ITEM_ENABLE, itemEnable, ITEMS_INVALID, ITEM_CLOSE_STUCK, ITEM_NEXT,
  ITEM_BACK, ITEM_CLOSED, ITEM_DISABLED, inputDisable, ITEM_ENABLED, inputEnable, ITEM_VALID, inputInvalid, INPUT_ADD,
  INPUT_VALUE_CHANGE, INPUT_DISABLE, INPUT_ENABLE, INPUT_INVALID, INPUT_VALID, INPUT_HIDE, inputHide, INPUT_SHOW, inputShow,
  NAVIGATE_TO_NEXT_ITEM, NAVIGATE_TO_PREVIOUS_ITEM, TANGY_TIMED_MODE_CHANGE, tangyTimedModeChange, TANGY_TIMED_TIME_SPENT,
  tangyTimedTimeSpent, TANGY_TIMED_LAST_ATTEMPTED, tangyTimedLastAttempted, TANGY_TIMED_INCREMENT, tangyTimedIncrement
} from './tangy-form-actions.js'

const tangyReduxMiddlewareLogger = store => next => action => {
  console.log('dispatching', action)
  let result = next(action)
  console.log('Next State', store.getState())
  return result
}

const tangyReduxMiddlewareCrashReporter = store => next => action => {
  try {
    return next(action)
  } catch (err) {
    console.error('Caught an exception!', err)
    console.log(action)
    console.log(store.getState())
    // throw err
  }
}

window.tangyReduxHook_INPUT_VALUE_CHANGE = () => {
  console.log('tangyReduxHook')
}

const tangyReduxMiddlewareTangyHook = store => next => action => {
  let result = next(action)
  switch (action.type) {
    case INPUT_VALUE_CHANGE:
    // window.tangyReduxHook_INPUT_VALUE_CHANGE(store)
  }
  return result
}

export { tangyReduxMiddlewareLogger, tangyReduxMiddlewareCrashReporter, tangyReduxMiddlewareTangyHook }
