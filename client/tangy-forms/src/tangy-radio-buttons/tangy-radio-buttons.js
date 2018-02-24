import {Element} from '../../node_modules/@polymer/polymer/polymer-element.js'

import '../tangy-radio-button/tangy-radio-button.js'
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
      <div id="container"></div>
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
        type: Array,
        value: [],
        observer: 'reflect',
        reflectToAttribute: true
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
        observer: 'reflect',
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
    this.render()
    this.reflect()
  }
  
  reflect() {
    this.shadowRoot.querySelectorAll('tangy-radio-button').forEach(el => {
      let matchingState = this.value.find(state => el.name == state.name)
      el.setProps(matchingState)
    })
  }

  render() {
    this.$.container.innerHTML = ''
    // Populate options as tangy-radio-button elements
    let options = this.querySelectorAll('option')
    for (let option of options) {
      let el = document.createElement('tangy-radio-button')
      el.name = option.value
      el.innerHTML = option.innerHTML
      this.$.container.appendChild(el)
    }

    let newValue = []
    this
      .shadowRoot
      .querySelectorAll('tangy-radio-button')
      .forEach ((el) => {
        el.addEventListener('change', this.onRadioButtonChange.bind(this))
        newValue.push(el.getProps())
      })
    if (this.value.length < newValue.length) {
      this.value = newValue
    }

  }

  onRadioButtonChange(event) {
    let targetButton = event.target
    if (targetButton.value = 'on') {
      this
        .$
        .container
        .querySelectorAll('tangy-radio-button')
        .forEach(el => {
          if (el.name !== targetButton.name && targetButton.value == 'on') {
            el.value =  ''
          } 
        })
    }

    let newValue = []
    this.shadowRoot
      .querySelectorAll('tangy-radio-button')
      .forEach(el => newValue.push(el.getProps()))
    this.value = newValue
    this.dispatchEvent(new CustomEvent('INPUT_VALUE_CHANGE', {bubbles: true, detail: {
      inputName: this.name,
      inputValue: newValue,
      inputIncomplete: false,
      inputInvalid: false
    }}))

  }

  onDisabledChange() {
    /*
    this
      .$
      .container
      .querySelectorAll('tangy-radio-button').forEach(el => el.disabled = this.disabled)
    let newValue = []
    this.shadowRoot
      .querySelectorAll('tangy-radio-button')
      .forEach(el => newValue.push(el.getProps()))
    this.value = newValue
    this.dispatchEvent(new CustomEvent('INPUT_VALUE_CHANGE', {bubbles: true, detail: {
      inputName: this.name,
      inputValue: newValue,
      inputIncomplete: false,
      inputInvalid: false
    }}))
    */
    this.value = this.value.map(state => Object.assign({}, state, {disabled: this.disabled}))
    this.dispatchEvent(new CustomEvent('INPUT_VALUE_CHANGE', {bubbles: true, detail: {
      inputName: this.name,
      inputValue: this.value,
      inputIncomplete: false,
      inputInvalid: false
    }}))
  }

  validate() {
    let foundOne = false
    this.shadowRoot.querySelectorAll('[name]').forEach(el => {
      if (el.value === 'on') foundOne = true
    })
    if (this.required && !this.hidden && !this.disabled && !foundOne) {
      this.invalid = true
      return false
    } else {
      this.invalid = false
      return true
    }
  }

}
window.customElements.define(TangyRadioButtons.is, TangyRadioButtons);
