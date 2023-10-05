import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import 'dr-niels-sortable-list/sortable-list.js'
import './util/html-element-props.js'
import '@polymer/paper-checkbox/paper-checkbox.js'
import '@polymer/paper-button/paper-button.js'
import '@polymer/iron-icon/iron-icon.js'
import '@polymer/iron-icons/iron-icons.js'
import './style/tangy-common-styles.js'
import './style/tangy-element-styles.js'
import './tangy-list-item.js'
// https://stackoverflow.com/a/2117523/10139471
function uuid() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

export class TangyList extends PolymerElement {

  static get is () {
    return 'tangy-list'
  }

  static get _props() {
   return ['name','value','label','disabled','invalid','incomplete','hidden']
  }

  static get properties () {
    return {
      name: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      maxCount: {
        type: Number,
        value: 999,
        reflectToAttribute: true
      },
      initialCount: {
        type: Number,
        value: 1,
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
      }

    }
  }

  static get template () {
    return html`
      <style include="tangy-common-styles"></style>
      <style include="tangy-element-styles"></style>
      <style>
        tangy-list-item {
          width: 100%
        }
      </style>
      <sortable-list id="items" style="width:100%">
      </sortable-list>
      <paper-button on-click="onClickNewItem" style="margin-left: 15px; background: var(--accent-color); color: var(--accent-text-color);" raised class="add-another"><iron-icon icon="add-circle"></iron-icon>ADD ANOTHER</paper-button>
    `
  }

  set value(value) {
    this.$.items.innerHTML = ``
    value.forEach(itemValue => this.addItem(itemValue))
  }

  get value() {
    return [...this.shadowRoot.querySelectorAll('tangy-list-item')].map(itemEl => itemEl.value)
  }

  connectedCallback () {
    super.connectedCallback()
    if (this.querySelector(`template[type="tangy-list/initial-items"]`)) {
      this.$.items.innerHTML = this.querySelector(`template[type="tangy-list/initial-items"]`).innerHTML
    } else {
      for (let i = 0; i < this.initialCount; i++ ) {
        this.addItem()
      }
    } 
  }

  onClickNewItem(event) {
    this.addItem()
  }

  addItem(itemValue) {
    const itemEl = document.createElement('tangy-list-item')
    itemEl.innerHTML = this.querySelector(`template[type="tangy-list/new-item"]`).innerHTML
    if (itemValue) itemEl.value = itemValue
    this.$.items.appendChild(itemEl)
  }

  validate() {
    // If one itemEl.validate() returns false, return false.
    return [...this.$.items.querySelectorAll('tangy-list-item')]
      .reduce((isValid, itemEl) => itemEl.validate() ? isValid : false, true)
  }
}
window.customElements.define(TangyList.is, TangyList)
