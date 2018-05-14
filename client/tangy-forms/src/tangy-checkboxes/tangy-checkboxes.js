import { Element } from '../../node_modules/@polymer/polymer/polymer-element.js'
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
      <span class="secondary_color">${t('Select one or more')}</span>
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
        value: '',
        observer: 'reflect',
        reflectToAttribute: true
      },
      value: {
        type: Array,
        value: [],
        observer: 'reflect',
        reflectToAttribute: true
      },
      atLeast: {
        type: Number,
        value: 0,
        observer: 'reflect',
        reflectToAttribute: true
      },
      required: {
        type: Boolean,
        value: false,
        observer: 'reflect',
        reflectToAttribute: true
      },
      disabled: {
        type: Boolean,
        value: false,
        observer: 'reflect',
        reflectToAttribute: true
      },
      label: {
        type: String,
        observer: 'reflect',
        value: ''
      },
      hidden: {
        type: Boolean,
        value: false,
        observer: 'reflect',
        reflectToAttribute: true
      },
      incomplete: {
        type: Boolean,
        value: true,
        observer: 'reflect',
        reflectToAttribute: true
      },
      invalid: {
        type: Boolean,
        value: false,
        observer: 'reflect',
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
      el.disabled = this.disabled
      el.hidden = this.hidden
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
      .forEach((el) => {
        el.addEventListener('change', this.onCheckboxClick.bind(this))
        newValue.push(el.getProps())
      })
    if (!this.value || (typeof this.value === 'object' && this.value.length < newValue.length)) {
      this.value = newValue
    }

  }

  onCheckboxClick(event) {
    let newValue = []
    this.shadowRoot
      .querySelectorAll('tangy-checkbox')
      .forEach(el => newValue.push(el.getProps()))
    this.value = newValue
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true, detail: {
        inputName: this.name,
        inputValue: newValue,
        inputIncomplete: false,
        inputInvalid: false
      }
    }))
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
window.customElements.define(TangyCheckboxes.is, TangyCheckboxes);
