import {Element} from '../../node_modules/@polymer/polymer/polymer-element.js'

import '../../node_modules/@polymer/paper-radio-button/paper-radio-button.js';
import '../../node_modules/@polymer/paper-radio-group/paper-radio-group.js';
import '../tangy-form/tangy-element-styles.js';
import '../tangy-form/tangy-common-styles.js'
/**
 * `tangy-radio-buttons`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class TangyRadioButtons extends Element {
  static get template() {
    return `
    <style include="tangy-element-styles"></style>
    <style include="tangy-common-styles"></style>

    <style>
      span {
        font-size: .75em;
        display: block;
      }
    </style>


    <div class="container">
      <label for="group">[[label]]</label>
      <span class="secondary_color">select only one</span>
      <paper-radio-group name="group" id="paper-radio-group">
      </paper-radio-group>
    </div>
`;
  }

  static get is() { return 'tangy-radio-buttons'; }

  static get properties() {
    return {
      name: {
        type: String,
        value: ''
      },
      value: {
        type: String,
        value: '',
        reflectToAttribute: true,
        observer: 'onValueChange'
      },
      required: {
        type: Boolean,
        value: false
      },
      disabled: {
        type: Boolean,
        value: false,
        observer: 'onDisabledChange',
        reflectToAttribute: true
      },
      label: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      hidden: {
        type: Boolean,
        value: false,
        observer: 'onHiddenChange',
        reflectToAttribute: true
      },
      invalid: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      incomplete: {
        type: Boolean,
        value: true,
        reflectToAttribute: true
      }
    }
  }

  connectedCallback() {
    super.connectedCallback()
    this.isReady = false
    let paperRadioGroupEl = this.shadowRoot.querySelector('paper-radio-group')
    paperRadioGroupEl.addEventListener('change', this.onPaperRadioGroupChange.bind(this), false)
    // Populate options as paper-radio-button elements
    let options = this.querySelectorAll('option')
    for (let option of options) {
      let button = document.createElement('paper-radio-button')
      button.name = option.value
      if (this.disabled) button.setAttribute('disabled', true)
      button.innerHTML = option.innerHTML
      paperRadioGroupEl.appendChild(button)
    }
    paperRadioGroupEl.selected = this.value
    if (this.required) paperRadioGroupEl.required = true
    this.isReady = true
  }

  onPaperRadioGroupChange(event) {
    // Stop propagation of paper-radio-button change event so we can set the value of this element first.
    // Otherwise tangy-form-item will find the wrong value for this element.
    event.stopPropagation()
    if (!this.isReady) return
    // The value we dispatch is the event.target.name. Remember, that's the option that was just selected
    // and the option's name selected is the value of this element.
    this.dispatchEvent(new CustomEvent('INPUT_VALUE_CHANGE', {
      detail: {
        inputName: this.name,
        inputValue: event.target.name,
        inputInvalid: false, 
        inputIncomplete: false 
      }, 
      bubbles: true
    }))
  }

  onValueChange(value) {
    if (!this.isReady) return
    this.$['paper-radio-group'].selected = value
  }

  onDisabledChange(value) {
    let paperRadioButtons = this.shadowRoot.querySelectorAll('paper-radio-button')
    if (value == true) paperRadioButtons.forEach((button) => button.setAttribute('disabled', true))
    if (value == false) paperRadioButtons.forEach((button) => button.removeAttribute('disabled'))
  }
  onHiddenChange(value) {
  }
}
window.customElements.define(TangyRadioButtons.is, TangyRadioButtons);
