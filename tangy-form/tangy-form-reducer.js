// Probably never used, tangy-form will set the form with a TangyFormResponseModel.
const initialState = {
  _id: 'form-1',
  formId: '',
  collection: 'TangyFormResponse',
  startDate: (new Date()).toLocaleString(),
  items: [],
  inputs: []
}

const tangyFormReducer = function (state = initialState, action) {
  var newState
  var tmp = {}
  var firstNotDisabled = 0

  switch(action.type) {

    case 'FORM_OPEN':
      let {cycleSequences} = action.response.form;
      const lastCycleIndex = `${action.response.form.id}-lastCycleIndex`
      const cycleSequencesArray = cycleSequences && cycleSequences.split('\n').map(e=>e.trim())
      let currentSequence = [...Array(action.response.items.length).fill().map((_, i) => i+1)]
      if(cycleSequences){
        let currentCycleIndex =0 ;
        if(localStorage.getItem(lastCycleIndex)){
          currentCycleIndex = Number(localStorage.getItem(lastCycleIndex))+1 < cycleSequencesArray.length
                              ?Number(localStorage.getItem(lastCycleIndex))+1
                              : 0
          localStorage.setItem(lastCycleIndex, String(currentCycleIndex))
        } else{
          localStorage.setItem(lastCycleIndex, String(currentCycleIndex))
        }
        currentSequence = cycleSequencesArray[currentCycleIndex].split(',');
      }
      currentSequence = currentSequence.map(sequence => parseInt(sequence))
      action.response.form =  {...action.response.form, sequenceOrderMap:String(currentSequence)}
      newState = Object.assign({}, action.response)
      // Ensure that the only items we have in the response are those that are in the DOM but maintain state of the existing items in the response.
      newState.items = action.itemsInDom.map((itemInDom, index) => {
        let result = newState.items.find(item => item.id === itemInDom.id);
        let merged = { ...itemInDom, ...result }
        return result ? {...merged}: {...itemInDom}
        }
      )
      // Determine items not in sequence and items in sequence. Then shove items not in sequence after the first entry in 
      // the items array because we can't have disabled items at the beginning or end.
      const itemsInSequence = currentSequence
        .map((sequenceNumber) => newState.items[sequenceNumber - 1])
      const itemsNotInSequence = newState
        .items
        .filter((item, index) => !currentSequence.includes(index+1))
      newState.items = [
        itemsInSequence.shift(),
        ...itemsNotInSequence.map((item) => { return { ...item, disabled: true } }),
        ...itemsInSequence
      ]
      newState.items[0]['firstOpenTime']= newState.items[0]['firstOpenTime'] ? newState.items[0]['firstOpenTime'] : Date.now()
      firstNotDisabled = newState.items.findIndex(item => !item.disabled)
      newState.items[firstNotDisabled].hideBackButton = true
      const indexOfSummaryItem = newState.items.findIndex(item => item.summary === true)
      if (indexOfSummaryItem !== -1) {
        newState.form.hasSummary = true
      } 
      if (!newState.form.complete) {
        newState.form.linearMode = true
        newState.form.hideClosedItems = true
      }
      let indexOfLastItem = newState.items.length - ([...newState.items].reverse().findIndex(item => !item.summary && !item.disabled) + 1)
      newState.items[indexOfLastItem].hideNextButton = true
      newState.items[indexOfLastItem].showCompleteButton = true
      if (!newState.form.complete && !newState.items.find(item => item.open)) newState.items[firstNotDisabled].open = true
      if (newState.form.hideClosedItems === true) newState.items.forEach(item => item.hidden = !item.open)
      if (newState.form.linearMode === true) newState.items.forEach(item => item.hideButtons = true)
      if (newState.form.fullscreen === true) newState.items.forEach(item => item.fullscreen = true)
      if (newState.form.openInFullscreen === true) {
        newState.form.fullscreenEnabled = true
        newState.items.forEach(item => {
          item.fullscreenEnabled = true
          item.fullscreenNavAlign = newState.form.fullscreenNavAlign
        })
      }
      return newState

    case 'OPEN_ALL_ITEMS':
    case 'CLOSE_ALL_ITEMS':
      return {
        ...state, 
        items: state.items.map(item => {
          return !item.disabled && action.type === 'OPEN_ALL_ITEMS'
            ? {
              ...item,
              open: true
            }
            : {
              ...item,
              open: false
            }
        })
      }

    case 'FORM_RESPONSE_COMPLETE':
      return Object.assign({}, state, {
        complete: true,
        endUnixtime: Date.now(),
        form: Object.assign({}, state.form, {
          complete: true,
          linearMode: false,
          hideClosedItems: false,
          fullscreen: false,
          fullscreenEnabled: false
        }),
        items: state.items.map(item => {
          let props = {}
          // If the item has inputs, then it was opened and potentially touched so don't hide buttons
          // so that they may review what is inside.
          // Look at the inputs for the item, only show buttons if it does actually have input.
          if (item.disabled) {
            props.hidden = true
          } else {
            props.hidden = false
            props.open = false
            props.hideButtons = false
          }
          if (!item.summary) {
            props.locked = true
          }
          props.hideBackButton = true
          props.hideNextButton = true
          props.fullscreen = false
          props.fullscreenEnabled = false
          props.inputs = item.inputs.map(input => {
            if (input.tagName === 'TANGY-TIMED') {
              return Object.assign({}, input, {disabled: true, mode: 'TANGY_TIMED_MODE_DISABLED'})
            } else if (input.tagName === 'TANGY-UNTIMED-GRID') {
              return Object.assign({}, input, {disabled: true, mode: 'TANGY_UNTIMED_GRID_MODE_DISABLED'})
            } else {
              return Object.assign({}, input, {disabled: true})
            }
          })
          if (item.feedback) {
            props.open = true
          }
          return Object.assign({}, item, props)
        })
      })

    case 'UNLOCK':
      return Object.assign({}, state, {
        complete: false,
        hasUnlocked: true,
        endUnixtime: undefined,
        form: Object.assign({}, state.form, {
          complete: false,
          linearMode:true, 
          hideClosedItems: true
        }),
        items: state.items.map((item, index) => {
          const itemMeta = action.meta.items.find(itemMeta => itemMeta.id === item.id)
          let props = {
            open: index === 0 ? true : false,
            hidden: index === 0 ? false : true,
            hideBackButton: index === 0 ? true : false,
            hideNextButton: index === (action.meta.items.length-1) ? true : false,
            hideButtons: true,
            locked: false
          }
          props.inputs = item.inputs.map(input => {
            const inputMeta = itemMeta.inputs.find(inputMeta => inputMeta.name === input.name)
            if (input.tagName && action.meta.disableComponents && action.meta.disableComponents.length > 0) {
              if (action.meta.disableComponents.find(e => e.toLowerCase() === input.tagName.toLowerCase())) {
                inputMeta.disabled = true
                inputMeta.readOnly = true
              }
            }
            return Object.assign({}, input,
              {
                disabled: inputMeta ? !!inputMeta.disabled : false,
                readOnly: inputMeta ? !!inputMeta.readOnly : false
              })
          })
          return Object.assign({}, item, itemMeta, props)
        })
      })
 
    case 'SHOW_RESPONSE':
      return Object.assign({}, state, { 
        form: Object.assign({}, state.form, {
          tabIndex: 1,
          showResponse: true,
          showSummary: false
        }),
        items: state.items.map((item) => {
          if (item.summary) {
            return Object.assign({}, item, { hidden: true })
          } else {
            return Object.assign({}, item, { hidden: false })
          }
      })})
 
    case 'SHOW_SUMMARY':
      return Object.assign({}, state, {
        form: Object.assign({}, state.form, {
          tabIndex: 0,
          showResponse: false,
          showSummary: true 
        }),
        items: state.items.map((item) => {
          if (item.summary) {
            return Object.assign({}, item, { open: true, hidden: false })
          } else {
            return Object.assign({}, item, { hidden: true })
          }
      })})     

    case 'ITEM_OPEN':
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

    case 'ITEM_CHANGE':
      newState = Object.assign({}, state)
      // Find the current index of the item opening.
      return Object.assign({}, newState, {items: state.items.map((item) => {
        if (item.id == action.itemId) {
          return Object.assign({}, item, {isDirty: true})
        }
        return item
      })})
      break

    case 'ITEM_CLOSE':
      tmp.itemIndex = state.items.findIndex(item => item.id === action.itemId)
      newState = Object.assign({}, state)

      // Mark open and closed.
      Object.assign(newState, {
        items: state.items.map((item) => {
          if (item.id == action.itemId) {
            return Object.assign({}, item, {open: false, isDirty: false, valid: true, hideButtons: false})
          }
          return Object.assign({}, item)
        })
      })
      // Calculate if there is next and previous item Ids.
      Object.assign(newState, calculateTargets(newState))
      return newState

    case 'ITEM_GO_TO':
      return calculateTargets({
        ...state,
        items: state.items.map(item => {
          return {
            ...item,
            open: item.id === action.itemId ? true : false,
            hidden: item.id === action.itemId ? false : true
          }
        })
      })
      break
    case 'ITEM_BACK':
    case 'ITEM_NEXT':
      tmp.itemIndex = state.items.findIndex(item => item.id === action.itemId)
      newState = Object.assign({}, state)
      // In case it next and previous hasn't been calculated yet.
      // @TODO: Do we need to do this??
      Object.assign(newState, calculateTargets(newState))
      // Mark open and closed.
      Object.assign(newState, {
        items: newState.items.map((item) => {
          let props = {}
          if (item.id == action.itemId) {
            props.open = false 
          }
          if (action.type === 'ITEM_BACK' && newState.previousItemId === item.id) {
            props.open = true
          }
          if (action.type === 'ITEM_NEXT' && newState.nextItemId === item.id) {
            if(!item.firstOpenTime) item.firstOpenTime = Date.now()
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



    case 'ITEM_ENABLE':
      newState = Object.assign({}, state, {
        items: state.items.map((item) => {
          if (item.id == action.itemId) {
            return Object.assign({}, item, {disabled: false})
          }
          return item
        })
      })
      return calculateTargets(newState)

    case 'ITEM_SAVE':
      newState = Object.assign({}, state, {
        items: state.items.map((item) => {
          if (item.id == action.item.id) {
            return Object.assign({}, item, action.item, { isDirty: false })
          }
          return item
        })
      })
      // Attach location information if there is a tangy-location with name of location.
      const foundLocation = action.item.inputs.find(input => input.name === 'location' && input.tagName === 'TANGY-LOCATION')
      if (foundLocation) {
        for (const locationInfo of foundLocation.value) {
          newState.location = {...newState.location, [locationInfo.level]: locationInfo.value}
        }
      } 
      newState['lastSaveUnixtime'] = Date.now()
      return newState

    case 'ITEM_DISABLE':
      newState = Object.assign({}, state, {
        items: state.items.map((item) => {
          if (item.id == action.itemId) {
            return Object.assign({}, item, {disabled: true})
          }
          return item
        })
      })
      return calculateTargets(newState)

    case 'ENABLE_ITEM_READONLY':
      return Object.assign({}, state, {
        items: state.items.map(item => {
          let props = {}
          props.locked = true
          props.inputs = item.inputs.map(input => {
            if (input.tagName === 'TANGY-TIMED') {
              return Object.assign({}, input, {disabled: true, mode: 'TANGY_TIMED_MODE_DISABLED'})
            } else if (input.tagName === 'TANGY-UNTIMED-GRID') {
              return Object.assign({}, input, {disabled: true, mode: 'TANGY_UNTIMED_GRID_MODE_DISABLED'})
            } else {
              return Object.assign({}, input, {disabled: true})
            }
          })
            return Object.assign({}, item, props)
          return item
        })
      })

    case 'DISABLE_ITEM_READONLY':
      return Object.assign({}, state, {
        items: state.items.map((item) => {
          let props = {}
          props.locked = false
          props.inputs = item.inputs.map(input => {
            if (input.tagName === 'TANGY-TIMED') {
              return Object.assign({}, input, {disabled: false, mode: 'TANGY_TIMED_MODE_DISABLED'})
            } else if (input.tagName === 'TANGY-UNTIMED-GRID') {
              return Object.assign({}, input, {disabled: false, mode: 'TANGY_UNTIMED_GRID_MODE_DISABLED'})
            } else {
              return Object.assign({}, input, {disabled: false})
            }
          })
            return Object.assign({}, item, props)
          return item
        })
      })

    case 'HIDE_ITEM_BUTTONS':
      newState = Object.assign({}, state, {
        items: state.items.map((item) => {
          item.hideButtons = true
          return item
        })
      })
      return newState

    case 'SHOW_ITEM_BUTTONS':
      newState = Object.assign({}, state, {
        items: state.items.map((item) => {
          item.hideButtons = false
          return item
        })
      })
      return newState

    case 'ENTER_FULLSCREEN':
      return {
        ...state,
        form: {
          ...state.form,
          fullscreenEnabled: true,
          exitClicks: state.form.exitClicks
        },
        items: state.items.map(item => {
          return { 
            ...item,
            fullscreenNavAlign: state.form.fullscreenNavAlign,
            fullscreenEnabled: true,
            exitClicks: state.form.exitClicks
          }
        })
      }

    case 'EXIT_FULLSCREEN':
      return {
        ...state,
        form: {
          ...state.form,
          fullscreenEnabled: false,
        },
        items: state.items.map(item => {
          return { ...item, fullscreenEnabled: false}
        })
      }

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

  let indexOfLastItem = newState.items.length - ([...newState.items].reverse().findIndex(item => !item.summary && !item.disabled) + 1)
  newState.items = newState.items.map((item, i) => Object.assign({}, item, { showCompleteButton: (indexOfLastItem === i) ? true : false}))

  return newState
}

export {tangyFormReducer}
