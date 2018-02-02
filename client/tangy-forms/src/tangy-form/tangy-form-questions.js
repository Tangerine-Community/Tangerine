/* jshint esversion: 6 */

import {Element as PolymerElement} from '../../node_modules/@polymer/polymer/polymer-element.js'
// import '../../node_modules/redux/dist/redux.js'
import {FORM_OPEN, formOpen, FORM_RESPONSE_COMPLETE, FOCUS_ON_ITEM, focusOnItem, ITEM_OPEN, itemOpen, ITEM_CLOSE, itemClose,
  ITEM_DISABLE, itemDisable, ITEM_ENABLE, itemEnable, ITEMS_INVALID, ITEM_CLOSE_STUCK, ITEM_NEXT,
  ITEM_BACK,ITEM_CLOSED,ITEM_DISABLED, inputDisable, ITEM_ENABLED, inputEnable, ITEM_VALID, inputInvalid, INPUT_ADD,
  INPUT_VALUE_CHANGE, INPUT_DISABLE, INPUT_ENABLE, INPUT_INVALID, INPUT_VALID, INPUT_HIDE, inputHide, INPUT_SHOW, inputShow,
  NAVIGATE_TO_NEXT_ITEM, NAVIGATE_TO_PREVIOUS_ITEM, TANGY_TIMED_MODE_CHANGE, tangyTimedModeChange, TANGY_TIMED_TIME_SPENT,
  tangyTimedTimeSpent, TANGY_TIMED_LAST_ATTEMPTED, tangyTimedLastAttempted, TANGY_TIMED_INCREMENT, tangyTimedIncrement} from './tangy-form-actions.js'
import './tangy-form-item.js'
import * as tangyFormActions from './tangy-form-actions.js'

//   <!-- Tangy Custom Inputs Elements -->

import '../tangy-input/tangy-input.js'
import '../tangy-timed/tangy-timed.js'
import '../tangy-checkbox/tangy-checkbox.js'
import '../tangy-checkboxes/tangy-checkboxes.js'
import '../tangy-radio-buttons/tangy-radio-buttons.js'
import '../tangy-location/tangy-location.js'
import '../tangy-gps/tangy-gps.js'
import '../tangy-overlay/tangy-overlay.js'

// <link rel="import" href="../tangy-timed/tangy-timed.html">
//   <link rel="import" href="../tangy-gps/tangy-gps.html">
//   <link rel="import" href="../tangy-location/tangy-location.html">
//   <link rel="import" href="../tangy-checkbox/tangy-checkbox.html">
//   <link rel="import" href="../tangy-checkboxes/tangy-checkboxes.html">
//   <link rel="import" href="../tangy-radio-buttons/tangy-radio-buttons.html">
//   <link rel="import" href="../tangy-eftouch/tangy-eftouch.html">
//   <link rel="import" href="../tangy-toggle-button/tangy-toggle-button.html">
//
//   <!-- Dependencies -->
import '../../node_modules/@polymer/paper-fab/paper-fab.js';
import '../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
//   <script src="../../bower_components/moment/min/moment-with-locales.min.js"></script>
//   <link rel="import" href="../../bower_components/paper-tabs/paper-tabs.html">
//   <link rel="import" href="../../bower_components/paper-fab.html">
//   <link rel="import" href="../../bower_components/paper-radio-group/paper-radio-group.html">
//   <link rel="import" href="../../bower_components/paper-radio-button/paper-radio-button.html">
//   <link rel="import" href="../../bower_components/iron-form/iron-form.html">
//   <link rel="import" href="../../bower_components/iron-icon/iron-icon.html">
//   <link rel="import" href="../../bower_components/iron-icons/iron-icons.html">
//   <link rel="import" href="../../bower_components/iron-icons/hardware-icons.html">
//   <link rel="import" href="../../bower_components/vaadin-icons/vaadin-icons.html">
//   <link rel="import" href="../../bower_components/paper-button/paper-button.html">
//   <link rel="import" href="../../bower_components/iron-form/iron-form.html">
//   <link rel="import" href="../../bower_components/paper-input/paper-input.html">
//   <link rel="import" href="../../bower_components/paper-input/paper-textarea.html">
//   <link rel="import" href="../../bower_components/paper-card/paper-card.html">
//   <link rel="import" href="../../bower_components/paper-checkbox/paper-checkbox.html">
//   <link rel="import" href="../../bower_components/paper-progress/paper-progress.html">
//   <link rel="import" href="../../bower_components/paper-dropdown-menu/paper-dropdown-menu.html">
//   <link rel="import" href="../../bower_components/paper-listbox/paper-listbox.html">
//   <link rel="import" href="../../bower_components/paper-item/paper-item.html">
//   <link rel="import" href="../../bower_components/gold-phone-input/gold-phone-input.html">
//   <link rel="import" href="../../bower_components/app-datepicker/app-datepicker.html">



    /**
     * `tangy-form-questions`
     * An element used to encapsulate form elements for multipage forms with a response in PouchDB.
     *
     * @customElement
     * @polymer
     * @demo demo/index.html
     */

export class TangyFormQuestions extends PolymerElement {

      static get template () {
        return `
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
        
        #markCompleteFab {}
        :host(:not([linear-mode])) #nextItemButton,
        :host(:not([linear-mode])) #previousItemButton
         {
          display: none;
        }
        :host([hide-complete-button]) #markCompleteFab {
          display: none !important;
        }
        #progress {
          position: fixed;
          bottom: 0px;
        }
        paper-progress {
          width: 100%;
        }
        #tangerine-footer {
          width:100%;
          background-color: #3c5b8d;
          height: 40px;
          position: fixed;
          bottom: 0px;
      }
      
      #previousItemButton,
      #nextItemButton {
        padding: 0;
        --paper-fab-iron-icon: {
          height: 50px;
          width: 50px;
        };
      }
      paper-fab {
        background-color: #f26f10 !important;
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
      </style>
      <slot></slot>
      <div id="nav">
        <paper-fab alt="complete" title="complete" id="markCompleteFab" mini on-click="markComplete" icon="icons:check"></paper-fab>
        <paper-fab id="lockedFab" mini icon="icons:lock" disabled></paper-fab>
      </div>
      <paper-progress id="progress" value="0" secondary-progress="0"></paper-progress>
      <div id="tangerine-footer">
          <paper-icon-button id="previousItemButton" on-click="focusOnPreviousItem" icon="icons:chevron-left"></paper-icon-button>
          <paper-icon-button id="nextItemButton" on-click="focusOnNextItem" icon="icons:chevron-right"></paper-icon-button>
      </div>
        `
      }

      static get is() { return 'tangy-form-questions'; }

      static get properties() {
        return {
          // Pass in code to be eval'd on any form input change.
          onChange: {
            type: String,
            value: '',
            reflectToAttribute: true
          },
          // Set liniar-mode to turn on navigation and turn off item action buttons.
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
          hideCompleteButton: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
          }

        }
      }

      connectedCallback() {
        super.connectedCallback()
        // Set up the store.
        this.store = window.tangyFormStore

        // Move to reducer.
        this.querySelectorAll('tangy-form-item').forEach((item) => {
          if (this.linearMode) item.noButtons = true
        })
        // Register tangy redux hook.
        window.tangyReduxHook_INPUT_VALUE_CHANGE = (store) => {
          let state = store.getState()
          let inputs = {}
          state.inputs.forEach(input => inputs[input.name] = input)
          let items = {}
          state.items.forEach(item => items[item.name] = item)
          let getValue = this.getValue.bind(this)
          // Eval on-change on tangy-form.
          eval(this.onChange)
          // Eval on-change on forms.
          let forms = [].slice.call(this.querySelectorAll('form[on-change]'))
          forms.forEach((form) => {
            if (form.hasAttribute('on-change')) {
              try {
                window.getValue = this.getValue.bind(this)
                eval(form.getAttribute('on-change'))
              } catch (error) {
                console.log("Error: " + error)
              }
            }
          })
        }

        // Subscribe to the store to reflect changes.
        this.unsubscribe = this.store.subscribe(this.throttledReflect.bind(this))
 
        // Notify store is open and send up the items if it does not have them.
        if (this.response.items.length === 0) {
          this.response.items = ([].slice.call(this.querySelectorAll('tangy-form-item'))).map((element) => element.getProps())
        }

        // Listen for tangy inputs dispatching INPUT_VALUE_CHANGE.
        this.addEventListener('INPUT_VALUE_CHANGE', (event) => {
          this.store.dispatch({
            type: INPUT_VALUE_CHANGE,  
            inputName: event.detail.inputName, 
            inputValue: event.detail.inputValue, 
            inputInvalid: event.detail.inputInvalid,
            inputIncomplete: event.detail.inputIncomplete
          })
        })

        formOpen(this.response)
        // Flag for first render.
        this.hasNotYetFocused = true

      }

      disconnectedCallback() {
        this.unsubscribe()
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

        // Set state in tangy-form-item elements.
        let items = [].slice.call(this.querySelectorAll('tangy-form-item'))
        items.forEach((item) => {
          let index = state.items.findIndex((itemState) => item.id == itemState.id) 
          if (index !== -1) item.setProps(state.items[index])
        })
        
        // Set progress state.
        this.$.progress.setAttribute('value', state.progress)

        // Find item to scroll to.
        if (state.focusIndex !== this.previousState.focusIndex || (this.linearMode && this.hasNotYetFocused)) {
          this.hasNotYetFocused = false
          setTimeout(() => {
            if (items[state.focusIndex]) items[state.focusIndex].scrollIntoView({behavior: 'smooth', block: 'start'})
          }, 200)
        }

        // Disable navigation buttons depending on wether there is a next or previous place to focus to.
        this.$.nextItemButton.disabled = (state.nextFocusIndex === -1 ||
                                          (state.items[state.focusIndex] && state.items[state.focusIndex].incomplete)
                                          ) ? true : false
        // Allow navigating back even if incomplete.
        this.$.previousItemButton.disabled = (state.previousFocusIndex === -1) ? true : false
        if (state.complete === true) {
          this.$.markCompleteFab.style.display =  'none'
          this.$.lockedFab.style.display =  'block'
        } else {
          this.$.markCompleteFab.style.display =  'block'
          this.$.lockedFab.style.display =  'none'
        }
        // Dispatch ALL_ITEMS_CLOSED if all items are now closed.
        let previouslyClosedItemCount = (this.previousState.items.filter(item => !item.open)).length
        let currentlyClosedItemCount = (state.items.filter(item => !item.open)).length
        if (previouslyClosedItemCount !== currentlyClosedItemCount && currentlyClosedItemCount === state.items.length) {
          this.dispatchEvent(new CustomEvent('ALL_ITEMS_CLOSED'))
        }

        // Stash as previous state.
        this.previousState = Object.assign({}, state)

        this.fireOnChange()

      }

      fireOnChange() {
        // Register tangy redux hook.
        let state = this.store.getState()
        let inputs = {}
        state.inputs.forEach(input => inputs[input.name] = input)
        let items = {}
        state.items.forEach(item => items[item.name] = item)
        // Declare namespaces for helper functions for the eval context in form.on-change.
        // We have to do this because bundlers modify the names of things that are imported
        // but do not update the evaled code because it knows not of it.
        let getValue = (name) => {
          let state = this.store.getState()
          let input = state.inputs.find((input) => input.name == name)
          if (input) return input.value
        }
        let inputHide = tangyFormActions.inputHide 
        let inputShow = tangyFormActions.inputShow
        let inputEnable = tangyFormActions.inputEnable
        let inputDisable = tangyFormActions.inputDisable
        let itemDisable = tangyFormActions.itemDisable
        let itemEnable = tangyFormActions.itemEnable
        eval(this.onChange)
      }

      focusOnPreviousItem(event) {
        this.$.previousItemButton.setAttribute('disabled', true)
        this.$.nextItemButton.setAttribute('disabled', true)
        let state = this.store.getState()
        let item = state.items.find(item => item.open)
        this.store.dispatch({ type: ITEM_BACK, itemId: item.id })
      }

      focusOnNextItem(event) {
        this.$.previousItemButton.setAttribute('disabled', true)
        this.$.nextItemButton.setAttribute('disabled', true)
        let state = this.store.getState()
        let item = state.items.find(item => item.open)
        this.store.dispatch({ type: ITEM_NEXT, itemId: item.id })
      }

      markComplete() {
        this.store.dispatch({type: "FORM_RESPONSE_COMPLETE"})
      }

      getValue(name) {
        let state = this.store.getState()
        let input = state.inputs.find((input) => input.name == name)
        if (input) return input.value
      }

    }

    
    window.customElements.define(TangyFormQuestions.is, TangyFormQuestions);

