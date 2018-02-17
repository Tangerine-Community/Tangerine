import {Element} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../../node_modules/@polymer/paper-checkbox/paper-checkbox.js';
import '../tangy-form/tangy-element-styles.js';
import '../tangy-form/tangy-common-styles.js'

/**
 * `tangy-checkboxes`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class TangyCheckboxes extends Element {
  static get template() {
    return `
    <style include="tangy-common-styles"></style>
    <style include="tangy-element-styles"></style>
    <style>

      :host {
        @apply --paper-font-common-base;
      }
      
      paper-checkbox {
        margin-top: 15px;
        margin-right: 25px;
      }
      span {
        font-size: .75em;
        display: block;
      }
      
      
    </style>
    <div class="container">
      <label for="group">[[label]]</label>
      <span class="secondary_color">select one or more</span>
      <div id="checkboxes">
      </div>
    </div>
`;
  }

  static get is() { return 'tangy-checkboxes'; }

  static get properties() {
    return {
      name: {
        type: String,
        value: ''
      },
      value: {
        type: Array,
        value: [],
        observer: 'onValueChange'
      },
      atLeast: {
        type: Number,
        value: 0
      },
      required: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      disabled: {
        type: Boolean,
        value: false,
        observer: 'onDisabledChange',
        reflectToAttribute: true
      },
      label: {
        type: String,
        value: ''
      },
      hidden: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      incomplete: {
        type: Boolean,
        value: true,
        reflectToAttribute: true
      },
      invalid: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      }
    }
  }

  connectedCallback() {

    super.connectedCallback()

    this.$.checkboxes.addEventListener('change', this.onCheckboxChange.bind(this), false)
    this.renderOptions()
  }
  renderOptions() {
    this.$.checkboxes.innerHTML = ''
    // Populate options as paper-radio-button elements
    let options = this.querySelectorAll('option')
    for (let option of options) {
      let checkbox = document.createElement('paper-checkbox')
      checkbox.name = option.value
      if (this.disabled) checkbox.setAttribute('disabled', true)
      checkbox.innerHTML = option.innerHTML
      this.$.checkboxes.appendChild(checkbox)
    }

  }

  onValueChange(value) {
    this.shadowRoot.querySelectorAll(`paper-checkbox`).forEach(checkbox => checkbox.checked = value.includes(checkbox.name))
  }

  onCheckboxChange(event) {
    // Needs hasAttribute no checked==true?
    let checkedElements = [].slice.call(this.$.checkboxes.querySelectorAll('paper-checkbox')).filter(checkbox => checkbox.checked === true)
    // The name of the checkbox is an entry in this value array.
    let value = checkedElements.map(el => el.name)
    // If not hidden and/or disabled, check for incomplete state.
    let isIncomplete = false
    // @TODO Check not needed? Wouldn't change if it was hidden or disabled. :P
    if (this.hidden !== true && this.disabled !== true) {
      if (value.length < this.atLeast) isIncomplete = true
      if (this.required === true && value.length === 0) isIncomplete = true
    }
    // Dispatch the event.
    // @TODO: Could call inputValueChange() action. Would be less moving parts, less magic.
    this.dispatchEvent(new CustomEvent('INPUT_VALUE_CHANGE', {
      detail: {
        inputName: this.name,
        inputValue: value,
        inputInvalid: false,
        inputIncomplete: isIncomplete
      },
      bubbles: true
    }))
  }

  onDisabledChange(value) {
    let paperCheckboxes = this.shadowRoot.querySelectorAll('paper-checkbox')
    if (value == true) paperCheckboxes.forEach((button) => button.setAttribute('disabled', true))
    if (value == false) paperCheckboxes.forEach((button) => button.removeAttribute('disabled'))
  }

}
window.customElements.define(TangyCheckboxes.is, TangyCheckboxes );
