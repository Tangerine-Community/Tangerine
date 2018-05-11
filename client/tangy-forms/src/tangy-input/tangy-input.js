/* jshint esversion: 6 */

import {Element as PolymerElement} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../../node_modules/@polymer/paper-input/paper-textarea.js'
import '../tangy-form/tangy-common-styles.js'
import '../tangy-form/tangy-element-styles.js'

    /**
     * `tangy-input`
     * 
     *
     * @customElement
     * @polymer
     * @demo demo/index.html
     */
export class TangyInput extends PolymerElement {

  constructor() {
    super()
    this.useThis = (this.getAttribute('type') === 'email' || 
               this.getAttribute('type') === 'number' || 
               this.getAttribute('type') === 'date' || 
               this.getAttribute('type') === 'time' || 
               this.getAttribute('allowed-pattern'))
               ? 'paper-input' : 'paper-textarea' 
    this.dontUseThis = (this.useThis === 'paper-input') ? 'paper-textarea' : 'paper-input' 
  }

  static get template () {
    return `
    <style include="tangy-common-styles"></style>
    <style include="tangy-element-styles"></style>
    <style>
      paper-input, paper-textarea {
        --paper-input-container-shared-input-style_-_font-size: 2em;
        --paper-font-subhead_-_font-size: 1em;
        --paper-font-subhead_-_line-height: 1em;
      }

    </style>

    <div class="container">
      <label>[[label]]</label>
      <paper-textarea 
        id="input" 
        label="${t('enterResponseToQuestion')}" 
        type="[[type]]" 
        error-message="[[errorMessage]]" 
        value="[[value]]" 
        allowed-pattern="[[allowedPattern]]">
        <template is="dom-if" if="required">
          <div slot="suffix"></div>
        </template>
      </paper-textarea>
      <paper-input 
        id="input" 
        label="${t('enterResponseToQuestion')}" 
        type="[[type]]" 
        error-message="[[errorMessage]]" 
        value="[[value]]" 
        allowed-pattern="[[allowedPattern]]">
        <template is="dom-if" if="required">
          <div slot="suffix"></div>
        </template>
      </paper-input>
    </div>
  `
  }

  static get is() { return 'tangy-input'; }

  static get properties() {
        return {
          name: {
            type: String,
            value: ''
          },
          private: {
            type: Boolean,
            value: false
          },
          label: {
            type: String,
            value: ''
          },
          type: {
            type: String,
            value: ''
          },
          errorMessage: {
            type: String,
            value: ''
          },
          required: {
            type: Boolean,
            value: false,
            observer: 'onRequiredChange',
            reflectToAttribute: true
          },
          disabled: {
            type: Boolean,
            value: false,
            observer: 'onDisabledChange',
            reflectToAttribute: true
          },
          hidden: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
          },
          invalid: {
            type: Boolean,
            value: false,
            observer: 'onInvalidChange',
            reflectToAttribute: true
          },
          incomplete: {
            type: Boolean,
            value: true,
            reflectToAttribute: true
          },
          value: {
            type: String,
            value: '',
            reflectToAttribute: true
          },
          allowedPattern: {
            type: String,
            value: '',
            reflectToAttribute: true
          }
        }
      }

      connectedCallback() {
        super.connectedCallback()
        this.shadowRoot.querySelector(this.dontUseThis).hidden = true
        this.shadowRoot.querySelector(this.useThis).addEventListener('value-changed', (event) => {
          this.value = this.$.input.value
          // @TODO tangy-form-item's listener for change events is not capturing this.
          let incomplete = (event.target.value === '') ? true : false
          this.value = event.target.value
          this.dispatchEvent(new Event('change', {
            detail: {
              inputName: this.name,
              inputValue: event.target.value,
              inputIncomplete: incomplete,
              inputInvalid: !this.$.input.validate()
            },
            bubbles: true
          }))
        })
      }

      onRequiredChange(value) {
        if (value === false) {
          this.shadowRoot.querySelector(this.useThis).removeAttribute('required')
        } else {
          this.shadowRoot.querySelector(this.useThis).setAttribute('required', true)
        }
      }

      onDisabledChange(value) {
        if (value === false) {
          this.shadowRoot.querySelector(this.useThis).removeAttribute('disabled')
        } else {
          this.shadowRoot.querySelector(this.useThis).setAttribute('disabled', true)
        }
      }

      onInvalidChange(value) {
        if (value === false) {
          this.shadowRoot.querySelector(this.useThis).removeAttribute('invalid')
        } else {
          this.shadowRoot.querySelector(this.useThis).setAttribute('invalid', true)
        }
      }

      onValueChange(value) {
        this.shadowRoot.querySelector(this.useThis).setAttribute('value', value) 
      }

      validate() {
        return this.shadowRoot.querySelector(this.useThis).validate()
      }

    }
    window.customElements.define(TangyInput.is, TangyInput);
