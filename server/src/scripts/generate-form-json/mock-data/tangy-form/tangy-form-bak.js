import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import './util/html-element-props.js'
import './style/tangy-common-styles.js'
import { t } from './util/t.js'

import { tangyFormReducer } from './tangy-form-reducer.js'
import { TangyFormResponseModel } from './tangy-form-response-model.js';
import { TangyFormItemHelpers } from './tangy-form-item-callback-helpers.js'


// Core elements.
import './tangy-form-item.js'
import './tangy-complete-button.js'
import './tangy-overlay.js'
import './tangy-input-groups.js'
import './tangy-input-group.js'
import './tangy-list.js'
import './tangy-template.js'

//   <!-- Dependencies -->
import '@polymer/paper-fab/paper-fab.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-tabs/paper-tab.js';
import '@polymer/paper-tabs/paper-tabs.js';
import 'translation-web-component/t-lang.js'

/**
 * `tangy-form`
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */

export class TangyForm extends PolymerElement {

  /*
   * Public API
   */

   getMeta() {
     return {
       ...this._meta,
       items: this._meta.items.map(metaItem => {
         const item = this.querySelector(`tangy-form-item#${metaItem.id}`)
         return {
           ...metaItem,
           inputs: item.getInputsMeta()
         }
       })
      }
    }

  // For creating a new response. Call it directly to force a new response when working programatically otherwise
  // this will get called later if no response has been assigned by the time afterNextRender is called.
  newResponse() {
    let initialResponse = new TangyFormResponseModel() 
    initialResponse.form = this.getProps()
    this.querySelectorAll('tangy-form-item').forEach((item) => {
      initialResponse.items.push(item.getProps())
    })
    this.response = initialResponse
  }

  // Set a form response to this property to resume a form response.
  set response(value) {
    this._responseHasBeenSet = true
    this.store.dispatch({ type: 'FORM_OPEN', response: value, itemsInDom: [...this.querySelectorAll('tangy-form-item')].map(itemEl => itemEl.getProps())})
    this.fireHook('on-open')
  }

  // Get the current form response.
  get response() {
    return (this._responseHasBeenSet) ? this.store.getState() : null 
  }

  // Get an array of all inputs across items.
  get inputs() {
    return this.response.items.reduce((acc, item) => [...acc, ...item.inputs], [])
  }

  // Get an object where object properties are input names and object property values are corresponding input values.
  get values() {
    return this.inputs.reduce((acc, input) => Object.assign({}, acc, {[input.name]: input.value}), {})
  }

  // Get the value of a single input by name.
  getValue(name) {
    let state = this.store.getState()
    let inputs = []
    state.items.forEach(item => inputs = [...inputs, ...item.inputs])
    //return (inputs[name]) ? inputs[name].value : undefined
    let foundInput = inputs.find(input => (input.name === name) ? input.value : false)
    if (foundInput && typeof foundInput.value === 'object') {
      let values = []
      foundInput.value.forEach(subInput => {
        if (subInput.value) {
          values.push(subInput.name)
        }
      })
      return values
    } else if (foundInput && foundInput.hasOwnProperty('value')) {
      return foundInput.value
    } else {
      return ''
    }
  }

  // Go to next item. Note, if validation fails, you will not go to the next item.
  next() {
    // Note that next needs to be called on the item level so that it can determine if it is valid and can actually close.
    this.querySelector('tangy-form-item[open=""]').next()
  }

  // Go to previous item. Note, if validation fails, you will not go to the previous item.
  back() {
    // Note that back needs to be called on the item level so that it can determine if it is valid and can actually close.
    this.querySelector('tangy-form-item[open=""]').back()
  }

  // Disable an item so it is skipped.
  itemDisable(itemId) { 
    let state = this.store.getState()
    let item = state.items.find(item => itemId === item.id)
    if (item && !item.disabled) this.store.dispatch({ type: 'ITEM_DISABLE', itemId: itemId })
  }

  // Enable an item so it is not skipped.
  itemEnable(itemId) {
    let state = this.store.getState()
    let item = state.items.find(item => itemId === item.id)
    if (item && item.disabled) this.store.dispatch({ type: 'ITEM_ENABLE', itemId: itemId })
  }

  enableItemReadOnly() {
    this.store.dispatch({
      type: 'ENABLE_ITEM_READONLY'
    })
  }

  disableItemReadOnly() {
    this.store.dispatch({
      type: 'DISABLE_ITEM_READONLY'
    })
  }

  // Hides Open/Close buttons
  hideItemButtons() {
    this.store.dispatch({
      type: 'HIDE_ITEM_BUTTONS'
    })
  }

  // Shows Open/Close buttons
  showItemButtons() {
    this.store.dispatch({
      type: 'SHOW_ITEM_BUTTONS'
    })
  }

  /*
   * Private.
   */

  static get template() {
    return html`
     
      <style include="tangy-common-styles"></style>
        
      <style>
        :host {
          width: 100%;
          display: block;
          margin: 0px;
          padding: 0px;
        }
        #previousItemButton,
        #nextItemButton {
            position: relative;
            color: #ffffff;
        }
        
        #previousItemButton[disabled],
        #nextItemButton[disabled] {
            color: #979797;
        }
        #previousItemButton {
          float: left;
        }
        #nextItemButton {
          float: right;
        }
        #markCompleteFab, #lockedFab {
          position: fixed;
          right: 7px;
          top: 24px;
        }

        #markCompleteButton {
          position: fixed;
          right: 7px;
          bottom: 2px;
          color: var(--accent-text-color);
        }

        #markCompleteFab {}
        :host(:not([linear-mode])) #nextItemButton,
        :host(:not([linear-mode])) #previousItemButton
         {
          display: none;
        }
        :host([hide-complete-fab]) #markCompleteFab {
          display: none !important;
        }
        #progress {
          position: fixed;
          bottom: 0px;
        }
        paper-progress {
          width: 100%;
        }
        :host(:not([has-summary])) #bar {
          display:none; 
        }
        #bar {
          width:100%;
          background-color: var(--primary-color);
          color: var(--accent-color);
        }
        #bar-filler {
          height: 45px;
        }
      
      #markCompleteButton,
      #previousItemButton,
      #nextItemButton {
        padding: 0;
        color: var(--accent-color);
        --paper-fab-iron-icon: {
          color: var(--accent-color);
          height: 75px;
          width: 75px;
        };
      }
      #markCompleteButton paper-icon-button,
      #previousItemButton paper-icon-button,
      #nextItemButton paper-icon-button, paper-icon-button {
        width: 75px;
        height: 75px;

      }
      paper-fab[disabled] {
        background-color: #cccccc !important;
      }
      paper-fab.pressed {
        background-color: #3c5b8d !important;
      }
      paper-fab.keyboard-focus {
        background-color: #1976d2;
      }
      paper-tab[aria-selected=true] {
        background: #f26f10;
        color: #FFF
      }
      :host(:not[error-logging]) #errors {
        display: none;
      }
      .error {
        background: white;
        border: solid 5px red;
        padding: 5px;
      }
      #close-all-items{
        display:none;
      }
      </style>
      <div id="nav"></div>
      <template is="dom-if" if="{{complete}}">
        <div style="text-align:right">
          <paper-button  id="open-all-items" on-click="openAllItems" >
              [[t.openAllItems]]
          </paper-button>
          <paper-button id="close-all-items" on-click="closeAllItems" >
              [[t.closeAllItems]]
          </paper-button>
        </div>
        <div id="bar">
          <paper-tabs selected="[[tabIndex]]" scrollable>
            <template is="dom-if" if="{{hasSummary}}">
              <paper-tab id="summary-button" on-click="onClickSummaryTab">[[t.summary]]</paper-tab>
            </template>
            <paper-tab id="response-button" on-click="onClickResponseTab">[[t.response]]</paper-tab>
          </paper-tabs>
        </div>
      </template>
      <div id="errors"></div>
      <div id="items"><slot></slot></div> 

        `;
  }

  onClickSummaryTab() {
    this.store.dispatch({ type: 'SHOW_SUMMARY' })
    setTimeout(() => {
      this.querySelector('[summary]').scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 200)
  }

  onClickResponseTab() {
    this.store.dispatch({ type: 'SHOW_RESPONSE' })
    //this.querySelectorAll('tangy-form-item').forEach(el => el.hidden = false)
    this.querySelectorAll('tangy-form-item')[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  openAllItems(){
    this.store.dispatch({ type: 'OPEN_ALL_ITEMS' })
    this.shadowRoot.querySelector('#open-all-items').style.display = 'none';
    this.shadowRoot.querySelector('#close-all-items').style.display = 'initial';
  }

  closeAllItems(){
    this.store.dispatch({ type: 'CLOSE_ALL_ITEMS' })
    this.shadowRoot.querySelector('#open-all-items').style.display = 'initial';
    this.shadowRoot.querySelector('#close-all-items').style.display = 'none';
  }

  static get is() { return 'tangy-form'; }

  static get properties() {
    return {
      fullscreen: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      title: {
        type: String,
        value: ''
      },
      complete: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      // Set linear-mode to turn on navigation and turn off item action buttons.
      linearMode: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      // Hide closed items to focus user on current item.
      hideClosedItems: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      hideCompleteFab: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      tabIndex: {
        type: Number,
        value: 0,
        reflectToAttribute: true
      },
      showResponse: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      showSummary: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      hasSummary: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      fullScreenGranted: {
        type: Boolean,
        value: false,
      },
      exitClicks: {
        type: Number,
        value: undefined,
        reflectToAttribute: true
      },
      cycleSequences: {
        type: String,
        value: undefined,
        reflectToAttribute: true
      },
      recordItemFirstOpenTimes: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      }, 
      endUnixtime: {
        type: Number,
        value: undefined,
        reflectToAttribute: true
      },
      lastSaveUnixtime: {
        type: Number,
        value: undefined,
        reflectToAttribute: true
      }
    }
  }

  constructor() {
    super()
    this.t = {
      summary: 'summary',
      response: 'response',
      openAllItems: 'Open All Items',
      closeAllItems: 'Close All Items',
    }
    this._responseHasBeenSet = false
    // Set up the store.
    this.store = Redux.createStore(
      tangyFormReducer,
      window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    )
  }

  ready() {
    super.ready()
    // Stash original meta state.
    this._meta = {
      form: this.getProps(),
      items: [...this.querySelectorAll('tangy-form-item')].map(itemEl => {
        return {
          ...itemEl.getProps(),
          // Skip because tangy-form-item may not be initialized.
          // inputs: itemEl.getInputsMeta()
        }
      })
    }
    // Pass events of items to the reducer.
    this.hasLazyItems = false
    this.querySelectorAll('tangy-form-item').forEach((item) => {
      if (item.getAttribute('src')) this.hasLazyItems = true
      // Pass in the store so on-change and on-open logic can access it.
      item.store = this.store
      if (this.linearMode) item.noButtons = true
      item.addEventListener('change', this.onItemChange.bind(this))
      item.addEventListener('ITEM_NEXT', this.onItemNext.bind(this))
      item.addEventListener('ITEM_BACK', this.onItemBack.bind(this))
      item.addEventListener('ITEM_CLOSED', this.onItemClosed.bind(this))
      item.addEventListener('ITEM_OPENED', this.onItemOpened.bind(this))
      item.addEventListener('FORM_RESPONSE_COMPLETE', this.onFormResponseComplete.bind(this))
      item.addEventListener('FORM_RESPONSE_NO_CONSENT', this.onFormResponseNoConsent.bind(this))
      item.addEventListener('logic-error', this.onItemError.bind(this))
      item.addEventListener('go-to', event => this.onItemGoTo(event))
    })

    // Subscribe to the store to reflect changes.
    if (this.hasLazyItems) {
      // Because items open asynchronously, we may need to throttle render to prevent two renders happening at the same time.
      this.unsubscribe = this.store.subscribe(this.throttledReflect.bind(this))
    } else {
      // We're synchronous. Much simpler!
      this.unsubscribe = this.store.subscribe(this.reflect.bind(this))
    }


    // Dispatch events out when state changes.
    this.store.subscribe(state => {
      this.dispatchEvent(new CustomEvent('TANGY_FORM_UPDATE'))
    })

    if (this.hasAttribute('on-submit')) {
      this.addEventListener('submit', (event) => {
        let form = this
        this.fireHook('on-submit')
      })
    }

    if (this.hasAttribute('on-resubmit')) {
      this.addEventListener('resubmit', (event) => {
        let form = this
        this.fireHook('on-resubmit')
      })
    }

    afterNextRender(this, function() {
      if (this._responseHasBeenSet === false) {
        this.newResponse()
      }
    })

    this.addEventListener('enter-fullscreen', () => {
      this.store.dispatch({type: 'ENTER_FULLSCREEN'})
    })
    this.addEventListener('exit-fullscreen', () => {
      this.store.dispatch({type: 'EXIT_FULLSCREEN'})
    })
    
  }

  disconnectedCallback() {
    if (this.unsubscribe) this.unsubscribe()
  }

  onFormResponseComplete(event) {
    this.store.dispatch({
      type: 'ITEM_SAVE',
      item: event.target.getProps()
    })
    let cancelledSubmit
    if (!this.response.hasUnlocked) {
      cancelledSubmit = !this.dispatchEvent(new CustomEvent('submit', {cancelable: true}))
    } else {
      cancelledSubmit = !this.dispatchEvent(new CustomEvent('resubmit', {cancelable: true}))
    }
    if (cancelledSubmit) return
    this.store.dispatch({
      type: 'FORM_RESPONSE_COMPLETE'
    })
    const cancelledComplete = !this.dispatchEvent(new CustomEvent('tangy-form-complete', {cancelable: true}))
    if (cancelledComplete) return
    if (this.hasSummary) {
      this.store.dispatch({ type: "SHOW_SUMMARY" })
    } else {
      this.store.dispatch({ type: "SHOW_RESPONSE" })
    }
    if (!this.response.hasUnlocked) {
      !this.dispatchEvent(new CustomEvent('after-submit', {cancelable: true})) || !this.dispatchEvent(new CustomEvent('tangy-form-complete', {cancelable: true}))
    } else {
      !this.dispatchEvent(new CustomEvent('after-resubmit', {cancelable: true})) || !this.dispatchEvent(new CustomEvent('tangy-form-complete', {cancelable: true}))
    }
  }

  onFormResponseNoConsent(event) {
    this.store.dispatch({
      type: 'ITEM_SAVE',
      item: event.target.getProps()
    })
    const cancelledSubmit = !this.dispatchEvent(new CustomEvent('submit', {cancelable: true}))
    if (cancelledSubmit) return
    this.store.dispatch({
      type: 'FORM_RESPONSE_COMPLETE'
    })
    // const cancelledComplete = !this.dispatchEvent(new CustomEvent('tangy-form-complete', {cancelable: true}))
    // if (cancelledComplete) return
    if (this.hasSummary) {
      this.store.dispatch({ type: "SHOW_SUMMARY" })
    } else {
      this.store.dispatch({ type: "SHOW_RESPONSE" })
    }
  }

  onItemChange(event) {
    this.store.dispatch({
      type: 'ITEM_CHANGE',
      itemId: event.target.id
    })
  }

  onItemNext(event) {
    this.store.dispatch({
      type: 'ITEM_SAVE',
      item: event.target.getProps()
    })
    this.fireHook('on-change')
    this.focusOnNextItem()
  }

  onItemBack(event) {
    this.store.dispatch({
      type: 'ITEM_SAVE',
      item: event.target.getProps()
    })
    this.fireHook('on-change')
    this.focusOnPreviousItem()
  }

  onItemGoTo(event) {
    this.store.dispatch({
      type: 'ITEM_SAVE',
      item: event.target.getProps()
    })
    this.fireHook('on-change')
    this.store.dispatch({
      type: 'ITEM_GO_TO',
      itemId: event.detail
    })
  }
  onItemOpened(event) {
    this.store.dispatch({
      type: 'ITEM_SAVE',
      item: event.target.getProps()
    })
  }

  onItemClosed(event) {
    this.store.dispatch({
      type: 'ITEM_SAVE',
      item: event.target.getProps()
    })
  }

  onItemError(event) {
    this.errorMessage(event.detail)
  }

  // Prevent parallel reflects, leads to race conditions.
  throttledReflect(iAmQueued = false) {
    // If there is an reflect already queued, we can quit.
    if (this.reflectQueued && !iAmQueued) return
    if (this.reflectRunning) {
      this.reflectQueued = true
      setTimeout(() => this.throttledReflect(true), 200)
    } else {
      this.reflectRunning = true
      this.reflect()
      this.reflectRunning = false
      if (iAmQueued) this.reflectQueued = false
    }
  }

  // Apply state in the store to the DOM.
  reflect() {

    let state = this.store.getState()
    // Set initial this.previousState
    if (!this.previousState) this.previousState = state

    this.setProps(state.form)

    // Tabs
    if (state.form && state.form.complete) {
      //this.shadowRoot.querySelector('paper-tabs').selected = (state.form.showSummary) ? '0' : '1'
    }
    // Set state in tangy-form-item elements.
    let items = [].slice.call(this.querySelectorAll('tangy-form-item'))
    items.forEach((item) => {
      let index = state.items.findIndex((itemState) => item.id == itemState.id)
      if (index !== -1) item.setProps(state.items[index])
    })

    // Find item to scroll to.
    if (state.focusIndex !== this.previousState.focusIndex) {
      if (items[state.focusIndex]) items[state.focusIndex].scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    // Dispatch ALL_ITEMS_CLOSED if all items are now closed.
    let previouslyClosedItemCount = (this.previousState.items.filter(item => !item.open)).length
    let currentlyClosedItemCount = (state.items.filter(item => !item.open)).length
    if (previouslyClosedItemCount !== currentlyClosedItemCount && currentlyClosedItemCount === state.items.length) {
      this.dispatchEvent(new CustomEvent('ALL_ITEMS_CLOSED'))
    }

    if (state.form && state.form.fullscreen) {
      if (!this.previousState.form.fullscreenEnabled && state.form.fullscreenEnabled) {
        this.enableFullscreen()
      }
      else if (this.previousState.form.fullscreenEnabled && !state.form.fullscreenEnabled) {
        this.disableFullscreen()
      }
    } else if (this.previousState.form.fullscreen && !state.form.fullscreen) {
      this.disableFullscreen()
    }

    // Stash as previous state.
    this.previousState = Object.assign({}, state)

  }

  fireHook(hook, event) {
    // If locked, bail.
    if (this.locked) return
    // If no hook, bail.
    if (!this.getAttribute(hook)) return
    // Prepare some helper variables.
    let state = this.store.getState()
    // Inputs.
    let inputsArray = []
    state.items.forEach(item => inputsArray = [...inputsArray, ...item.inputs])
    let inputsKeyedByName = {}
    inputsArray.forEach(input => inputsKeyedByName[input.name] = input)
    let inputs = inputsKeyedByName
    // Items.
    let items = {}
    state.items.forEach(item => items[item.name] = item)
    let inputEls = this.shadowRoot.querySelectorAll('[name]')
    let tangyFormStore = this.store
    let itemEnable = name => this.itemEnable(name)
    let itemDisable = name => this.itemDisable(name)
    let skip = name => this.itemDisable(name)
    let unskip = name => this.itemEnable(name)
    let sectionEnable = name => this.itemEnable(name)
    let sectionDisable = name => this.itemDisable(name)
    let helpers = new TangyFormItemHelpers(this)
    let getValue = (name) => this.getValue(name)
    let inputHide = (name) => helpers.inputHide(name)
    let inputShow = (name) => helpers.inputShow(name)
    let inputDisable = (name) => helpers.inputDisable(name)
    let inputEnable = (name) => helpers.inputEnable(name)
    let itemsPerMinute = (input) => helpers.itemsPerMinute(input)
    let numberOfItemsAttempted = (input) => helpers.numberOfItemsAttempted(input)
    let numberOfCorrectItems = (input) => helpers.numberOfCorrectItems(input)
    let numberOfIncorrectItems = (input) => helpers.numberOfIncorrectItems(input)
    let gridAutoStopped = (input) => helpers.gridAutoStopped(input)

    // Use itemInputs instead of inputs in modules such as Class in order to summon only the inputs on-screen/in the currently active form.
    let itemInputs = [...this.shadowRoot.querySelectorAll('[name]')].reduce((acc, input) => Object.assign({}, acc, {[input.name]: input}), {})
    try {
      eval(this.getAttribute(hook))
    } catch (e) {
      const message = `${t(`Error detected in the form's logic:`)} ${hook}`
      console.log(message)
      console.log(e)
      this.errorMessage(message)
    }
  }

  errorMessage(message) {
    if (!this.hasAttribute('error-logging')) return
    const errorEl = document.createElement('div')
    errorEl.innerHTML = message
    errorEl.classList.add('error')
    this.shadowRoot.querySelector('#errors').appendChild(errorEl)
    this.style.background = 'red'
    setTimeout(() => {
      this.style.background = 'transparent'
    }, 400)
  }

  focusOnPreviousItem(event) {
    // Dispatch action.
    let state = this.store.getState()
    let item = state.items.find(item => item.open)
    this.store.dispatch({ type: 'ITEM_BACK', itemId: item.id })
  }

  focusOnNextItem(event) {
    // Dispatch action.
    let state = this.store.getState()
    let item = state.items.find(item => item.open)
    this.store.dispatch({ type: 'ITEM_NEXT', itemId: item.id })
  }

  disableFullscreen() {
    if(document.webkitExitFullscreen) document.webkitExitFullscreen()
    if(document.exitFullscreen) document.exitFullscreen()
    this.removeEventListener('click', this.enableFullscreen, true)
  }

  enableFullscreen() {
      if(this.requestFullscreen) {
        this.requestFullscreen()
            .then(message => {
              this.fullScreenGranted = true;
            })
            .catch(err => {
              console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
              this.fullScreenGranted = false;
              this.dispatchEvent(new CustomEvent('fullscreen-rejected'))
            });
      } else if(this.mozRequestFullScreen) {
        this.mozRequestFullScreen();
      } else if(this.webkitRequestFullscreen) {
        this.webkitRequestFullscreen();
      } else if(this.msRequestFullscreen) {
        this.msRequestFullscreen();
      }

  }

  unlock() {
    const meta = this.getMeta()
    this.store.dispatch({
      type: 'UNLOCK',
      meta
    })
  }

}


window.customElements.define(TangyForm.is, TangyForm);

