/* jshint esversion: 6 */

import {Element as PolymerElement} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../../node_modules/@polymer/paper-checkbox/paper-checkbox.js'
import '../tangy-form/tangy-common-styles.js'
import '../tangy-form/tangy-element-styles.js'

    /**
     * `tangy-checkbox`
     *
     *
     * @customElement
     * @polymer
     * @demo demo/index.html
     */
export class TangyCheckbox extends PolymerElement {
  static get template () {
    return `
    <style include="tangy-common-styles"></style>
    <style include="tangy-element-styles"></style>

      <paper-checkbox id="checkbox">[[label]]</paper-checkbox>
    `
  }

  static get is () {
    return 'tangy-checkbox'
  }

  static get properties () {
    return {
      name: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      label: {
        type: String,
        value: '',
        reflectToAttribute: true
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
      hidden: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      value: {
        type: String,
        value: '',
        observer: 'onValueChange',
        reflectToAttribute: true
      }

    }
  }

  connectedCallback () {
    super.connectedCallback()
    if (this.value) this.$.checkbox.checked = true
    if (this.label == '' && this.innerHTML !== '') {
      this.label = this.innerHTML
    }
    this.$.checkbox.addEventListener('change', (e) => {
      e.stopPropagation()
      let incomplete = (!e.target.checked)
      this.value = e.target.checked ? 'on' : ''
      this.dispatchEvent(new Event('change', { bubbles: true }))
      this.dispatchEvent(new CustomEvent('INPUT_VALUE_CHANGE', {
        bubbles: true,
        detail: {
          inputName: this.name,
          inputValue: !!(e.target.checked),
          inputIncomplete: incomplete,
          inputInvalid: !this.$.checkbox.validate()
        }
      }))
    })
  }

  onRequiredChange (value) {
    if (value === false) {
      this.$.checkbox.removeAttribute('required')
    } else {
      this.$.checkbox.setAttribute('required', true)
    }
  }

  onInvalidChange (value) {
    if (value === false) {
      this.$.checkbox.removeAttribute('invalid')
    } else {
      this.$.checkbox.setAttribute('invalid', true)
    }
  }

  onDisabledChange (value) {
    if (value === false) {
      this.$.checkbox.removeAttribute('disabled')
    } else {
      this.$.checkbox.setAttribute('disabled', true)
    }
  }

  onValueChange (value) {
    if (value) this.$.checkbox.setAttribute('checked', true)
    if (!value) this.$.checkbox.removeAttribute('checked')
  }

  validate() {
    if (this.required === true && 
        this.value === '' && 
        this.disabled === false && 
        this.hidden === false) {
      this.invalid = true
      return false
    } else {
      this.invalid = false
      return true
    }
  }
}
window.customElements.define(TangyCheckbox.is, TangyCheckbox)
