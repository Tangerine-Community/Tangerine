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

  static get template () {
    return `
    <style include="tangy-common-styles"></style>
    <style include="tangy-element-styles"></style>
    <style>
      paper-textarea {
        --paper-input-container-shared-input-style_-_font-size: 2em;
        --paper-font-subhead_-_font-size: 1em;
        --paper-font-subhead_-_line-height: 1em;
      }

    </style>

    <div id="container">
      
    </div>
  `
  }

  static get is() { return 'tangy-input'; }

  static get properties() {
        return {
          name: {
            type: String,
            observer: 'render',
            value: ''
          },
          label: {
            type: String,
            observer: 'render',
            value: ''
          },
          type: {
            type: String,
            observer: 'render',
            value: ''
          },
          errorMessage: {
            type: String,
            observer: 'render',
            value: ''
          },
          required: {
            type: Boolean,
            value: false,
            observer: 'render',
            reflectToAttribute: true
          },
          disabled: {
            type: Boolean,
            value: false,
            observer: 'render',
            reflectToAttribute: true
          },
          hidden: {
            type: Boolean,
            value: false,
            observer: 'render',
            reflectToAttribute: true
          },
          invalid: {
            type: Boolean,
            value: false,
            observer: 'render',
            reflectToAttribute: true
          },
          incomplete: {
            type: Boolean,
            value: true,
            observer: 'render',
            reflectToAttribute: true
          },
          value: {
            type: String,
            value: '',
            observer: 'render',
            reflectToAttribute: true
          },
          allowedPattern: {
            type: String,
            value: '',
            observer: 'render',
            reflectToAttribute: true
          }
        }
      }
      connectedCallback() {
        super.connectedCallback()
        this.render()
      }
      render() {
        this.shadowRoot.querySelector('#container').innerHTML = `
          <label>${this.label}</label>
          <${(this.type === 'email' || this.type === 'number' || this.type === 'date' || this.allowedPattern !== '') ? `paper-input` : `paper-textarea`}
            id="input" 
            label="Enter your response to above question here" 
            type="${this.type}" 
            error-message="${this.errorMessage}" 
            value="${this.value}" 
            ${this.required ? 'required' : ''}
            ${this.disabled ? 'disabled' : ''}
            ${this.invalid ? 'invalid' : ''}
            allowed-pattern="${this.allowedPattern}">
            ${this.required ? `<div slot="suffix"></div>` : ``}
          </${(this.type === 'email' || 
               this.type === 'number' || 
               this.type === 'date' || 
               this.allowedPattern !== '') 
               ? `paper-input` : `paper-textarea`}>
        `
        this.shadowRoot.querySelector('#input').addEventListener('value-changed', (event) => {
          // @TODO tangy-form-item's listener for change events is not capturing this.
          let incomplete = (event.target.value === '') ? true : false
          this.dispatchEvent(new CustomEvent('INPUT_VALUE_CHANGE', {
            detail: {
              inputName: this.name,
              inputValue: event.target.value,
              inputIncomplete: incomplete,
              inputInvalid: !event.target.validate()
            },
            bubbles: true
          }))
        })
      }
      validate() {
        return this.shadowRoot.querySelector('#input').validate()
      }
    }
    window.customElements.define(TangyInput.is, TangyInput);
