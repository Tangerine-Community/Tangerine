/* jshint esversion: 6 */

import {Element as PolymerElement} from '../../node_modules/@polymer/polymer/polymer-element.js'
// import '../../node_modules/redux/dist/redux.js'
import {FORM_OPEN, formOpen, FORM_RESPONSE_COMPLETE, FOCUS_ON_ITEM, focusOnItem, ITEM_OPEN, itemOpen, ITEM_CLOSE, itemClose,
  ITEM_DISABLE, itemDisable, ITEM_ENABLE, itemEnable, ITEMS_INVALID, ITEM_CLOSE_STUCK, ITEM_NEXT, completeFabHide, completeFabShow,
  ITEM_BACK,ITEM_CLOSED,ITEM_DISABLED, inputDisable, ITEM_ENABLED, inputEnable, ITEM_VALID, inputInvalid, INPUT_ADD,
  INPUT_VALUE_CHANGE, INPUT_DISABLE, INPUT_ENABLE, INPUT_INVALID, INPUT_VALID, INPUT_HIDE, inputHide, INPUT_SHOW, inputShow,
  NAVIGATE_TO_NEXT_ITEM, NAVIGATE_TO_PREVIOUS_ITEM, TANGY_TIMED_MODE_CHANGE, tangyTimedModeChange, TANGY_TIMED_TIME_SPENT,
  tangyTimedTimeSpent, TANGY_TIMED_LAST_ATTEMPTED, tangyTimedLastAttempted, TANGY_TIMED_INCREMENT, tangyTimedIncrement} from './tangy-form-actions.js'
import './tangy-form-item.js'
import * as tangyFormActions from './tangy-form-actions.js'
import './tangy-common-styles.js'
//   <!-- Tangy Custom Inputs Elements -->

import '../tangy-input/tangy-input.js'
import '../tangy-timed/tangy-timed.js'
import '../tangy-checkbox/tangy-checkbox.js'
import '../tangy-checkboxes/tangy-checkboxes.js'
import '../tangy-radio-buttons/tangy-radio-buttons.js'
import '../tangy-location/tangy-location.js'
import '../tangy-gps/tangy-gps.js'
import '../tangy-complete-button/tangy-complete-button.js'
import '../tangy-overlay/tangy-overlay.js'
import '../tangy-acasi/tangy-acasi.js';

//   <!-- Dependencies -->
import '../../node_modules/@polymer/paper-fab/paper-fab.js';
import '../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../node_modules/@polymer/paper-tabs/paper-tab.js';
import '../../node_modules/@polymer/paper-tabs/paper-tabs.js';


    /**
     * `tangy-form`
     *
     * @customElement
     * @polymer
     * @demo demo/index.html
     */

export class TangyForm extends PolymerElement {

      static get template () {
        return `
     
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
        #bar {
          width:100%;
          background-color: var(--primary-color);
          color: var(--accent-color);
          height: 99px;
          position: fixed;
          top: 0px;
          z-index:999;
        }
        #fake-top-bar {
          background: var(--primary-color-dark);
          padding: 8px 0px 0px 8px;
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
      </style>

      <div id="nav"></div>
      <template is="dom-if" if="{{complete}}">
        <div id="bar-filler">filler</div>
        <div id="bar">
          <div id="fake-top-bar">
            <a id="home-button" href="../shell/index.html">
                <img src="../logo.svg" width=35>
            </a>
          </div>
          <paper-tabs selected="[[tabIndex]]" scrollable>
            <paper-tab id="summary-button" on-click="onClickSummaryTab">summary</paper-tab>
            <paper-tab id="response-button" on-click="onClickResponseTab">response</paper-tab>
          </paper-tabs>
          <!--template is="dom-if" if="{{showSummary}}">
            <paper-tabs selected="0" scrollable>
              <paper-tab id="summary-button" on-click="onClickSummaryTab">summary</paper-tab>
              <paper-tab id="response-button" on-click="onClickResponseTab">response</paper-tab>
            </paper-tabs>
          </template>
          <template is="dom-if" if="{{showResponse}}">
            <paper-tabs selected="1" scrollable>
              <paper-tab id="summary-button" on-click="onClickSummaryTab">summary</paper-tab>
              <paper-tab id="response-button" on-click="onClickResponseTab">response</paper-tab>
            </paper-tabs>
          </template-->
        </div>
      </template>
      <slot></slot>

        `
      }

      onClickSummaryTab() {
        this.store.dispatch({type: 'SHOW_SUMMARY'})
        //this.querySelectorAll('tangy-form-item').forEach(el => el.hidden = true)
        //this.querySelector('[summary]').hidden = false
        //this.querySelector('[summary]').setAttribute('open', true)
        setTimeout(() => {
          this.querySelector('[summary]').scrollIntoView({behavior: 'smooth', block: 'start'})
        }, 200)
      }

      onClickResponseTab() {
        this.store.dispatch({type: 'SHOW_RESPONSE'})
        //this.querySelectorAll('tangy-form-item').forEach(el => el.hidden = false)
        this.querySelectorAll('tangy-form-item')[0].scrollIntoView({behavior: 'smooth', block: 'center'})
      }

      static get is() { return 'tangy-form'; }

      static get properties() {
        return {
          id: {
            type: String,
            value: 'tangy-form'
          },
          // Pass in code to be eval'd on any form input change.
          onChange: {
            type: String,
            value: '',
            reflectToAttribute: true
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
          item.addEventListener('ITEM_NEXT', this.onItemNext.bind(this))
          item.addEventListener('ITEM_BACK', this.onItemBack.bind(this))
          item.addEventListener('ITEM_CLOSED', this.onItemClosed.bind(this))
          item.addEventListener('ITEM_OPENED', this.onItemOpened.bind(this))
          item.addEventListener('FORM_RESPONSE_COMPLETE', this.onFormResponseComplete.bind(this))
        })


        // Subscribe to the store to reflect changes.
        this.unsubscribe = this.store.subscribe(this.throttledReflect.bind(this))

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

        // Flag for first render.
        this.hasNotYetFocused = true

      }
      
      disconnectedCallback() {
        this.unsubscribe()
      }

      onFormResponseComplete(event) {
        this.store.dispatch({
          type: 'ITEM_SAVE',
          item: event.target.getProps() 
        })
        this.store.dispatch({
          type: 'FORM_RESPONSE_COMPLETE'
        })
        this.store.dispatch({type: "SHOW_SUMMARY"})
      }

      onItemNext(event) {
        this.store.dispatch({
          type: 'ITEM_SAVE',
          item: event.target.getProps() 
        })
        this.focusOnNextItem()
      }

      onItemBack(event) {
        this.store.dispatch({
          type: 'ITEM_SAVE',
          item: event.target.getProps() 
        })
        this.focusOnPreviousItem()
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
        if (state.form.complete) {
          //this.shadowRoot.querySelector('paper-tabs').selected = (state.form.showSummary) ? '0' : '1'
        }

        // Set state in tangy-form-item elements.
        let items = [].slice.call(this.querySelectorAll('tangy-form-item'))
        items.forEach((item) => {
          let index = state.items.findIndex((itemState) => item.id == itemState.id)
          if (index !== -1) item.setProps(state.items[index])
        })

        // Find item to scroll to.
        if (state.focusIndex !== this.previousState.focusIndex || (this.linearMode && this.hasNotYetFocused && !state.form.complete)) {
          this.hasNotYetFocused = false
          setTimeout(() => {
            if (items[state.focusIndex]) items[state.focusIndex].scrollIntoView({behavior: 'smooth', block: 'start'})
          }, 200)
        }

        // Dispatch ALL_ITEMS_CLOSED if all items are now closed.
        let previouslyClosedItemCount = (this.previousState.items.filter(item => !item.open)).length
        let currentlyClosedItemCount = (state.items.filter(item => !item.open)).length
        if (previouslyClosedItemCount !== currentlyClosedItemCount && currentlyClosedItemCount === state.items.length) {
          this.dispatchEvent(new CustomEvent('ALL_ITEMS_CLOSED'))
        }

        // Stash as previous state.
        this.previousState = Object.assign({}, state)

        if (!this.complete) this.fireOnChange()

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
          let state = window.tangyFormStore.getState()
          let inputs = []
          state.items.forEach(item => inputs = [...inputs, ...item.inputs])
          //return (inputs[name]) ? inputs[name].value : undefined
          let inputFound = inputs.find(input => (input.name === name) ? input.value : false)
          if (inputFound) {
            return inputFound.value
          } else {
            return undefined
          }

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
        // Dispatch action.
        let state = this.store.getState()
        let item = state.items.find(item => item.open)
        this.store.dispatch({ type: ITEM_BACK, itemId: item.id })
      }

      focusOnNextItem(event) {
        // Dispatch action.
        let state = this.store.getState()
        let item = state.items.find(item => item.open)
        this.store.dispatch({ type: ITEM_NEXT, itemId: item.id })
      }

      getValue(name) {
        let state = this.store.getState()
        let input = state.inputs.find((input) => input.name == name)
        if (input) return input.value
      }

    }


    window.customElements.define(TangyForm.is, TangyForm);

