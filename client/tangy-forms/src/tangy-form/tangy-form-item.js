/* jshint esversion: 6 */

import {Element as PolymerElement} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../../node_modules/@polymer/paper-card/paper-card.js'

// Import actions as a catchall so we can later declare variables of the same name as the properties for use
// in form.on-change logic. This protects us against the bundler's renaming of imported variables and functions
// so that Editor written code will still be able to reference actions by actual name.
import * as tangyFormActions from './tangy-form-actions.js'

// Import relevant actions.
import {
  ITEM_OPEN,
  itemOpen,
  ITEM_CLOSE,
  itemClose,
  ITEM_DISABLE,
  itemDisable,
  ITEM_ENABLE,
  itemEnable,
  ITEMS_INVALID,
  ITEM_CLOSE_STUCK,
  ITEM_NEXT,
  INPUT_ADD
  } from './tangy-form-actions.js'


  /**
   * `tangy-form-item`
   * An element used to encapsulate form elements for multipage forms with a response in PouchDB.
   *
   * @customElement
   * @polymer
   * @demo demo/index.html
   */

export class TangyFormItem extends PolymerElement {

  static get template()
    {
      return `
  <style>
:host {
  /*margin: 15px;*/
}
/*
 * Card
 */
paper-card {
  -webkit-transition: .4s;
  -moz-transition: .4s;
  -ms-transition: .4s;
  -o-transition: .4s;
  display: block;
  max-width: 325px;
  margin: /*30px*/ auto;
}
:host([open]) paper-card {
  -webkit-transition: .4s;
  -moz-transition: .4s;
  -ms-transition: .4s;
  -o-transition: .4s;
  display: block;
  max-width: 720px;
}
:host([disabled]) paper-card {
  --paper-card-background-color: gray !important;
  --paper-card-header-color: #CCC;
}
:host([hidden]) {
  display: none;
}

/*
 * Action Buttons
 */
.card-actions {
  height: 45px;
}
:host([open]) #open {
  display: none;
}
:host(:not([open])) #close {
  display: none;
}
:host([disabled]) #open {
  display: none;
}
:host([hide-buttons]) #open,
:host([hide-buttons]) #close {
  display: none;
}

label.heading {
  font-size: 20px !important;
  margin-bottom: 20px;
  display: block;
}

</style>

<paper-card id="card" class="shrunk">


  <div class="card-content">
    <label class="heading">[[title]]</label>
    <div id="content"></div>
    <slot></slot>
  </div>

  <div class="card-actions">
    <paper-button id="open">open</paper-button>
    <paper-button id="close">close</paper-button>
    <template is="dom-if" if="{{!incomplete}}">
      <iron-icon style="color: var(--primary-color); float: right; margin-top: 10px" icon="icons:check-circle"></iron-icon>
    </template>
  </div>

  </paper-card>`
    }

    static get is() { return 'tangy-form-item'; }

    constructor() {
      super()
    }

    static get properties() {
      return {

        // Configuration
        id: {
          type: String,
          value: 'tangy-form-item',
          reflectToAttribute: true
        },
        src: {
          type: String,
          value: 'tangy-form-item',
          reflectToAttribute: true
        },
        title: {
          type: String,
          value: '',
          reflectToAttribute: true
        },
        hideButtons: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
        },
        inputs: {
          type: Array,
          value: []
        },

        // State
        open: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
          observer: 'onOpenChange',
        },
        incomplete: {
          type: Boolean,
          value: true,
          reflectToAttribute: true
        },
        disabled: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
        },
        hidden: {
          type: Boolean,
          value: false,
          relfectToAttribute: true
        }

      };
    }

    async connectedCallback() {

        await PolymerElement.prototype.connectedCallback.call(this);

        this.store = window.tangyFormStore
        this.$.close.addEventListener('click', () => this.store.dispatch({
          type: ITEM_CLOSE,
          itemId: this.id
        }));
        this.$.open.addEventListener('click', () => this.store.dispatch({
          type: ITEM_OPEN,
          itemId: this.id
        }));

        // Listen for tangy inputs dispatching INPUT_VALUE_CHANGE.
        this.$.content.addEventListener('INPUT_VALUE_CHANGE', (event) => {
          this.store.dispatch({
            type: 'INPUT_VALUE_CHANGE',
            inputName: event.detail.inputName,
            inputValue: event.detail.inputValue,
            inputInvalid: event.detail.inputInvalid,
            inputIncomplete: event.detail.inputIncomplete
          })
        })

        // Subscribe to the store to reflect changes.
        this.unsubscribe = this.store.subscribe(this.throttledReflect.bind(this))

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

      // Set state in input elements.
      let inputs = [].slice.call(this.$.content.querySelectorAll('[name]'))
      inputs.forEach((input) => {
        let index = state.inputs.findIndex((inputState) => inputState.name == input.name)
        if (index !== -1) input.setProps(state.inputs[index])
      })

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
      // Eval on-change on forms.
      let formEl = this.shadowRoot.querySelector('form[on-change]')
      if (formEl) {
        eval(formEl.getAttribute('on-change'))
      }
    }

    async onOpenChange(open) {
      // Close it.
      if (open === false) {
        this.$.content.innerHTML = ''
      }
      // Open it, but only if empty because we might be stuck.
      if (open === true && !this.disabled && this.$.content.innerHTML === '') {
        let request = await fetch(this.src)
        this.$.content.innerHTML = await request.text()
        this.$.content.querySelectorAll('[name]').forEach((input) => {
          // @TODO Past tense?
          this.store.dispatch({type: INPUT_ADD, itemId: this.id, attributes: input.getProps()})
        })
        // this.store.dispatch({type: ITEM_OPENED, itemId: this.id })
        this.dispatchEvent(new CustomEvent('tangy-form-item-opened', {bubbles: true}))
      }
    }

    onDisabledChange(newState, oldState) {
      if (newState === true && oldState === false) {
        this.store.dispatch({type: ITEM_DISABLED, itemId: this.id })
      }
    }

    validate() {
      let inputs = this.querySelectorAll('[name]')
      let invalidInputNames = []
      let validInputNames = []
      inputs.forEach((input) => {
        if (input.validate && !input.hidden && !input.validate()) {
          invalidInputNames.push(input.name)
        } else {
          validInputNames.push(input.name)
        }
      })
      if (invalidInputNames.length > 0) {
        invalidInputNames.forEach(input => this.store.dispatch({ type: INPUT_INVALID, inputName: input.name }))
        validInputNames.forEach(input => this.store.dispatch({ type: INPUT_VALID, inputName: input.name }))
        return false
      } else {
        return true
      }
    }


  }

window.customElements.define(TangyFormItem.is, TangyFormItem);
