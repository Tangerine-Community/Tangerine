/* jshint esversion: 6 */

import {Element as PolymerElement} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../../node_modules/@polymer/paper-radio-button/paper-radio-button.js'
import '../tangy-form/tangy-common-styles.js'
import '../tangy-form/tangy-element-styles.js'

    /**
     * `tangy-radio-button`
     *
     *
     * @customElement
     * @polymer
     * @demo demo/index.html
     */
export class TangyRadioButton extends PolymerElement {
  static get template () {
    return `
    <style include="tangy-common-styles"></style>
    <style include="tangy-element-styles"></style>

      <paper-radio-button id="radioButton">[[label]]</paper-radio-button>
    `
  }

  static get is () {
    return 'tangy-radio-button'
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
    if (this.value) this.$.radioButton.checked = true
    if (this.label == '' && this.innerHTML !== '') {
      this.label = this.innerHTML
    }
    this.$.radioButton.addEventListener('change', (e) => {
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
          inputInvalid: !this.$.radioButton.validate()
        }
      }))
    })
  }

  onRequiredChange (value) {
    if (value === false) {
      this.$.radioButton.removeAttribute('required')
    } else {
      this.$.radioButton.setAttribute('required', true)
    }
  }

  onInvalidChange (value) {
    if (value === false) {
      this.$.radioButton.removeAttribute('invalid')
    } else {
      this.$.radioButton.setAttribute('invalid', true)
    }
  }

  onDisabledChange (value) {
    if (value === false) {
      this.$.radioButton.removeAttribute('disabled')
    } else {
      this.$.radioButton.setAttribute('disabled', true)
    }
  }

  onValueChange (value) {
    if (value) this.$.radioButton.setAttribute('checked', true)
    if (!value) this.$.radioButton.removeAttribute('checked')
  }
}
window.customElements.define(TangyRadioButton.is, TangyRadioButton)
