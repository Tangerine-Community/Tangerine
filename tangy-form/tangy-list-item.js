import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import './util/html-element-props.js'
import '@polymer/paper-card/paper-card.js'
import './style/tangy-common-styles.js'
import './style/tangy-element-styles.js'

export class TangyListItem extends PolymerElement {
  static get template () {
    return html`
    <style include="tangy-common-styles"></style>
    <style include="tangy-element-styles"></style>
    <style>
    :host {
      position: relative;
    }
    paper-card { width: 100%; }
    paper-fab {
      position: absolute;
      top: -15px;
      right: -15px;
      --paper-fab-background: var(--accent-color);
      --paper-fab-keyboard-focus-background: var(--accent-color);
    }
    </style>
    <paper-card id="content">
      <slot></slot>
    </paper-card>
    <paper-fab mini icon="close" id="remove" on-click="onRemoveClick"></paper-fab>
    `
  }

  static get is () {
    return 'tangy-list-item'
  }

  static get _props() {
   return ['name','value','label','disabled','invalid','incomplete','hidden','correct']
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
      disabled: {
        type: Boolean,
        value: false,
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
      },
      hidden: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      correct: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      }

    }
  }

  connectedCallback () {
    super.connectedCallback()
  }

  get value() {
		if (this.shadowRoot && this.querySelectorAll('[name]').length > 0) {
      this._value = [...this.querySelectorAll('[name]')].map(inputEl => inputEl.getProps())
    }
    return this._value ? this._value : []
  }

  set value(value) {
		this._value = value
		this._value.forEach(inputProps => this.querySelector(`[name=${inputProps.name}]`).setProps(inputProps))
  }

  validate() {
    return [...this.querySelectorAll('[name]')]
      .reduce((isValid, inputEl) => inputEl.validate() ? isValid : false, true)
  }

  onRemoveClick() {
    this.remove()
  }

}
window.customElements.define(TangyListItem.is, TangyListItem)
