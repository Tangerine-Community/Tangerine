import {Element} from '../../node_modules/@polymer/polymer/polymer-element.js'

import '../tangy-form/tangy-element-styles.js';
import '../tangy-form/tangy-common-styles.js'
import './mdc-select-style.js'
/**
 * `tangy-select`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class TangySelect extends Element {
  static get template() {
    return `
    <style include="tangy-element-styles"></style>
    <style include="tangy-common-styles"></style>
    <style include="mdc-select-style"></style>
    <div id="container"></div>
    `;
  }

  static get is() { return 'tangy-select'; }

  static get properties() {
    return {
      name: {
        type: String,
        value: '',
        observer: 'reflect',
        reflectToAttribute: true
      },
      value: {
        type: String,
        value: '',
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
        value: '',
        observer: 'reflect',
        reflectToAttribute: true
      },
      secondaryLabel: {
        type: String,
        value: '',
        observer: 'reflect',
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
        observer: 'reflect',
        reflectToAttribute: true
      },
      incomplete: {
        type: Boolean,
        value: true,
        observer: 'reflect',
        reflectToAttribute: true
      }
    }
  }

  constructor() {
    super()
    this.value = ''
  }

  connectedCallback() {
    super.connectedCallback()
    this.render()
    this.reflect()
  }
  
  reflect() {
    let selectEl = this
      .shadowRoot
      .querySelector('select')
    if (selectEl) {
      selectEl.setProps(this.getProps())
    }
  }

  render() {
    this.$.container.innerHTML = ''
    let options = []
    this.querySelectorAll('option').forEach(optionEl => options.push(optionEl))
    this.$.container.innerHTML = `
      <label for="group">${this.label}</label>
      <div class="mdc-select">
        <select class="mdc-select__surface" value="${this.value}">
          ${ (this.secondaryLabel) ? `
            <option value="" default selected disabled>${this.secondaryLabel}</option>
          ` : ``}
          ${options.map((option, i) => `
            <option 
              value="${option.value}" 
            >
              ${option.innerHTML}
            </option>
          `)}
        </select>
      </div>
      <div class="mdc-select__bottom-line"></div>
    
    `

    this
      .shadowRoot
      .querySelector('select')
      .addEventListener('change', this.onChange.bind(this))

  }

  onChange(event) {
    this.value = event.target.value 
    this.dispatchEvent(new CustomEvent('change'))
  }

  validate() {
    if (this.required && !this.hidden && !this.disabled && !this.value) {
      this.invalid = true
      return false
    } else {
      this.invalid = false
      return true
    }
  }

}
window.customElements.define(TangySelect.is, TangySelect);
