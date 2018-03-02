/* jshint esversion: 6 */

import {Element as PolymerElement} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../../node_modules/@polymer/paper-card/paper-card.js'
import './tangy-common-styles.js'
import { TangyFormItemHelpers } from './tangy-form-item-callback-helpers.js'

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
  <style include="tangy-common-styles"></style>
  <style>
:host {
  margin: 15px;
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
  max-width: 920px;
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
  margin-bottom: 100px;
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
label.heading {
  font-size: 21px !important;
  margin-bottom: 20px;
  display: block;
  color: var(--primary-color);
  font-weight: 700;
}
paper-button {
  font-size: .5em;
}
</style>

<paper-card id="card" class="shrunk">

  <div class="card-content">
  <label class="heading">[[title]]</label>
    <div id="content"></div>
    <slot></slot>
  </div>

  <div class="card-actions">
    <template is="dom-if" if="{{!hideButtons}}">
      <paper-button id="open" on-click="onOpenButtonPress">open</paper-button>
      <paper-button id="close" on-click="onCloseButtonPress">close</paper-button>
    </template>
    <template is="dom-if" if="{{open}}">
      <template is="dom-if" if="{{!hideBackButton}}">
        <paper-button id="back" on-click="back">back</paper-button>
      </template>
      <template is="dom-if" if="{{!hideNextButton}}">
        <paper-button id="submit" on-click="next">next</paper-button>
      </template>
    </template>
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
        summary: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
        },
        hideButtons: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
        },
        hideBackButton: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
        },
        hideNextButton: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
        },
        inputs: {
          type: Array,
          observer: 'reflect',
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

    // Apply state in the store to the DOM.
    reflect() {
      this.inputs.forEach((inputState) => {
        let inputEl = this.shadowRoot.querySelector(`[name=${inputState.name}]`)
        if (inputEl) inputEl.setProps(inputState)
      })
    }

    fireOnChange(event) {
      this.fireHook('on-change', event)
    }

    fireHook(hook, event) {
      if (hook === 'on-change') {
        let input = event.target
      }
      let state = window.tangyFormStore.getState()
      let inputs = {}
      this.shadowRoot.querySelectorAll('[name]').forEach(input => inputs[input.name] = input)
      let items = {}
      state.items.forEach(item => items[item.name] = item)
      let inputEls = this.shadowRoot.querySelectorAll('[name]')
      // Declare namespaces for helper functions for the eval context in form.on-change.
      // We have to do this because bundlers modify the names of things that are imported
      // but do not update the evaled code because it knows not of it.
      let helpers = new TangyFormItemHelpers(this)
      let getValue = (name) => helpers.getValue(name)
      let inputHide = (name) => helpers.inputHide(name)
      let inputShow = (name) => helpers.inputShow(name)
      let inputDisable = (name) => helpers.inputDisable(name)
      let inputEnable = (name) => helpers.inputEnable(name)
      // Eval on-change on forms.
      let formEl = this.shadowRoot.querySelector('form[on-change]')
      if (formEl) {
        eval(formEl.getAttribute(hook))
      }
    }

    onOpenButtonPress() {
      this.open = true
      this.dispatchEvent(new CustomEvent('ITEM_OPENED'))
    }

    onCloseButtonPress() {
      if (this.submit()) {
        this.open = false 
        this.dispatchEvent(new CustomEvent('ITEM_CLOSED'))
      }
    }

    async onOpenChange(open) {
      // Close it.
      if (open === false) {
        this.$.content.innerHTML = ''
      }
      // Open it, but only if empty because we might be stuck.
      if (open === true && this.$.content.innerHTML === '') {
        let request = await fetch(this.src, {credentials: 'include'})
        this.$.content.innerHTML = await request.text()
        this.$.content
          .querySelectorAll('[name]')
          .forEach(input => {
            input.addEventListener('change', this.fireOnChange.bind(this))
            input.addEventListener('FORM_RESPONSE_COMPLETE', this.onFormResponseComplete.bind(this))
          })
        this.dispatchEvent(new CustomEvent('TANGY_FORM_ITEM_OPENED'))
      }
      let form = this.shadowRoot.querySelector('form')
      if (open === true && form && form.getAttribute('on-open')) {
        this.fireHook('on-open')
        this.fireHook('on-change')
      }
      this.reflect()
    }

    onDisabledChange(newState, oldState) {
      if (newState === true && oldState === false) {
        this.store.dispatch({type: ITEM_DISABLED, itemId: this.id })
      }
    }

    onFormResponseComplete() {
      if(this.submit()) {
        this.dispatchEvent(new CustomEvent('FORM_RESPONSE_COMPLETE'))
      }
    }

    submit() {
      let invalidInputNames = this.validate()
      if (invalidInputNames.length !== 0) {
        // @TODO Scroll to invalid input.
        this.shadowRoot
          .querySelector(`[name=${invalidInputNames[0]}]`)
          .scrollIntoView({behavior: 'smooth', block: 'start'})
        this.inpcomplete = true
        return false
      } else {
        let inputs = []
         this
          .shadowRoot
          .querySelectorAll('[name]')
          .forEach(input => inputs.push(input.getProps()))
        this.inputs = inputs
        this.incomplete = false 
        return true
      }
    }

    validate() {
      let inputs = this.shadowRoot.querySelectorAll('[name]')
      let invalidInputNames = []
      let validInputNames = []
      inputs.forEach((input) => {
        if (input.validate && !input.hidden && !input.validate()) {
          invalidInputNames.push(input.name)
        } else {
          validInputNames.push(input.name)
        }
      })
      return invalidInputNames
    }

    next() {
      if(this.submit()) { 
        this.dispatchEvent(new CustomEvent('ITEM_NEXT'))
      }
    }

    back() {
      if(this.submit()) { 
        this.dispatchEvent(new CustomEvent('ITEM_BACK'))
      }
    }

  }

window.customElements.define(TangyFormItem.is, TangyFormItem);
