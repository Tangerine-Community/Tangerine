import {Element} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../tangy-checkbox/tangy-checkbox.js'
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
        @apply --tangy-font-common-base;
      }
      
      tangy-checkbox {
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
        observer: 'reflect'
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
    this.render()
    this.reflect()
  }

  reflect() {
    this.shadowRoot.querySelectorAll('tangy-checkbox').forEach(el => {
      let matchingState = this.value.find(state => el.name == state.name)
      el.setProps(matchingState)
    })
  }

  render() {
    this.$.checkboxes.innerHTML = ''
    // Populate options as tangy-radio-button elements
    let options = this.querySelectorAll('option')
    for (let option of options) {
      let checkbox = document.createElement('tangy-checkbox')
      checkbox.name = option.value
      checkbox.innerHTML = option.innerHTML
      this.$.checkboxes.appendChild(checkbox)
    }

    let newValue = []
    this
      .shadowRoot
      .querySelectorAll('tangy-checkbox')
      .forEach ((el) => {
        el.addEventListener('change', this.onCheckboxClick.bind(this))
        newValue.push(el.getProps())
      })
    if (this.value.length < newValue.length) {
      this.value = newValue
    }

  }

  onCheckboxClick(event) {
    let newValue = []
    this.shadowRoot
      .querySelectorAll('tangy-checkbox')
      .forEach(el => newValue.push(el.getProps()))
    this.value = newValue
    this.dispatchEvent(new CustomEvent('INPUT_VALUE_CHANGE', {bubbles: true, detail: {
      inputName: this.name,
      inputValue: newValue,
      inputIncomplete: false,
      inputInvalid: false
    }}))
  }

  onDisabledChange(value) {
    this.value = this.value.map(state => Object.assign({}, state, { disabled: true }))
  }

}
window.customElements.define(TangyCheckboxes.is, TangyCheckboxes );
