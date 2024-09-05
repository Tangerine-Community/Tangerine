import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import './util/html-element-props.js'
import '@polymer/paper-checkbox/paper-checkbox.js'
import './style/tangy-common-styles.js'
import './style/tangy-element-styles.js'
import './tangy-input-group.js'
// https://stackoverflow.com/a/2117523/10139471
function uuid() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}


/**
 * `tangy-input-groups`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class TangyInputGroups extends PolymerElement {

  static get is () {
    return 'tangy-input-groups'
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
      <div id="groups">
        <slot></slot>
      </div>
      <paper-button on-click="newGroup" style="margin-left: 15px; background: var(--accent-color); color: var(--accent-text-color);" raised class="add-another"><iron-icon icon="add-circle"></iron-icon>ADD ANOTHER</paper-button>
    `
  }

  set value(value) {
    if (!Array.isArray(value)) return
    this._value = value
    const keysInData = value
    const keysInDom = [...this.querySelectorAll('tangy-input-group[name]')].map(input => input.name)
    // Add keys that are in data but not in the DOM.
    const keysToAdd = keysInData.filter(keyInData => keysInDom.indexOf(keyInData) === -1)
    // Remove keys that are not in the data but are in DOM.
    const keysToRemove = keysInDom.filter(keyInDom => keysInData.indexOf(keyInDom) === -1)
    keysToAdd.forEach(key => {
      const inputGroupEl = document.createElement('tangy-input-group')
      inputGroupEl.innerHTML = this._template
      inputGroupEl.setAttribute('name', key)
      inputGroupEl.addEventListener('input-group-remove', event => this.removeGroup(event.target.name))
      inputGroupEl.querySelectorAll('[name]').forEach(input => input.setAttribute('name', `${key}.${input.getAttribute('name')}`))
      this.appendChild(inputGroupEl)
      inputGroupEl.querySelectorAll('[name]').forEach(input => {
        input.addEventListener('change', (e) => {
          this.dispatchEvent(new Event('change', { bubbles: true }))
        })
      })
    })
    keysToRemove.forEach(key => {
      this.removeChild(this.querySelector(`[name="${key}"]`))
    })
    if (this.firstTimeSet) {
      this.dispatchEvent(new Event('change', { bubbles: true }))
    } else {
      this.firstTimeSet = true
    }
  }

  get value() {
    return this._value ? this._value : []
  }

  connectedCallback () {
    super.connectedCallback()
    this._template = this.innerHTML
    this.innerHTML = ''
    if (!this.getAttribute('value')) {
      let initialValue = []
      for (let i = 0; i < this.initialCount; i++ ) {
        initialValue.push(`${this.name}.${i}`)
      }
      this.value = initialValue
    } else {
      // @TODO support setting value on initial markup.
    }
  }

  newGroup() {
    this.value = [...this.value, `${this.name}.${this.value.length}`]
  }

  appendGroup(groupProps) {

  }

  removeGroup(groupName) {
    this.value = this.value.filter(groupProps => groupProps !== groupName)
  }

  validate() {
    return true
  }
}
window.customElements.define(TangyInputGroups.is, TangyInputGroups)
