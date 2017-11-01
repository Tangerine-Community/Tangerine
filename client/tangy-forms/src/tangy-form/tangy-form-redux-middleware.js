const tangyReduxMiddlewareLogger = store => next => action => {
  console.log('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
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
      window.tangyReduxHook_INPUT_VALUE_CHANGE(store)
  }
  return result
}