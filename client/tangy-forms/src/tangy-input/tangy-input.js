/* jshint esversion: 6 */

import {Element as PolymerElement} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../../node_modules/@polymer/paper-input/paper-input.js'

    /**
     * `tangy-input`
     *
     *
     * @customElement
     * @polymer
     * @demo demo/index.html
     */
export class TangyInput extends PolymerElement {

  static get template () {
    return `
<style include="tangy-element-styles"></style>

    <div class="container">
      <label>[[label]]</label>
      <paper-input 
        id="input" 
        label="Enter your response to above question here" 
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
        this.$.input.addEventListener('change', (event) => {
          this.value = this.$.input.value
          // @TODO tangy-form-item's listener for change events is not capturing this.
          let incomplete = (event.target.value === '') ? true : false
          this.dispatchEvent(new CustomEvent('INPUT_VALUE_CHANGE', {
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
          this.$.input.removeAttribute('required')
        } else {
          this.$.input.setAttribute('required', true)
        }
      }

      onDisabledChange(value) {
        if (value === false) {
          this.$.input.removeAttribute('disabled')
        } else {
          this.$.input.setAttribute('disabled', true)
        }
      }

      onInvalidChange(value) {
        if (value === false) {
          this.$.input.removeAttribute('invalid')
        } else {
          this.$.input.setAttribute('invalid', true)
        }
      }

      onValueChange(value) {
        this.$.input.setAttribute('value', value)
      }

      validate() {
        return this.$.input.validate()
      }

    }
    window.customElements.define(TangyInput.is, TangyInput);
