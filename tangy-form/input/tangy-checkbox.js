import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../util/html-element-props.js'
import '@polymer/paper-checkbox/paper-checkbox.js'
import '../style/tangy-common-styles.js'
import '../style/tangy-element-styles.js'
import { TangyInputBase } from '../tangy-input-base.js'

    /**
     * `tangy-checkbox`
     *
     *
     * @customElement
     * @polymer
     * @demo demo/index.html
     */
export class TangyCheckbox extends TangyInputBase {
  static get template () {
    return html`
    <style include="tangy-common-styles"></style>
    <style include="tangy-element-styles"></style>
    <style>
        :host {
          --tangy-element-border: 0;
        }
      </style>
      
    <div class="flex-container">
      <div id="qnum-number"></div>
      <div id="qnum-content">
        <paper-checkbox id="checkbox" id="checkbox">
          <div id="checkbox-text">
          </div>
          <label id="hint-text" class="hint-text"></label>
          </label>
        </paper-checkbox>
        <div id="error-text"></div>
        <div id="warn-text"></div>
        <div id="discrepancy-text"></div>
      </div>
    </div>
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
        observer: 'applyLabel',
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
      hintText: {
        type: String,
        value: '',
        reflectToAttribute: true,
        observer: 'onHintTextChanged'
      },
      hasWarning: {
        type: Boolean,
        value: false,
        observer: 'onWarnChange',
        reflectToAttribute: true
      },
      hasDiscrepancy: {
        type: Boolean,
        value: false,
        observer: 'onDiscrepancyChange',
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
      skipped: {
        type: Boolean,
        value: false,
        observer: 'onSkippedChange',
        reflectToAttribute: true
      },
      value: {
        type: String,
        value: '',
        observer: 'onValueChange',
        reflectToAttribute: true
      },
      errorText: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      warnText: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      discrepancyText: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      identifier: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      }
    }
  }

  connectedCallback () {
    super.connectedCallback()
    this.render()
  }

  render() {
    if (this.value) {
      this.$.checkbox.checked = true
    } else {
      this.$.checkbox.checked = false
    }
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
    this.$['hint-text'].innerHTML = this.hintText
    this.shadowRoot.querySelector('.hint-text').innerHTML = this.hasAttribute('hint-text') 
      ? this.getAttribute('hint-text') 
      : ''
    this.shadowRoot.querySelector('#qnum-number').innerHTML = this.hasAttribute('question-number') 
      ? `<label>${this.getAttribute('question-number')}</label>`
      : ''
    
  }

  onHintTextChanged() {
    this.$['hint-text'].innerHTML = this.hintText
  }

  applyLabel(label) {
    this.$.checkbox.children['checkbox-text'].innerHTML = this.label 
  }

  onRequiredChange (value) {
    if (value === false) {
      this.$.checkbox.removeAttribute('required')
    } else {
      this.$.checkbox.setAttribute('required', true)
    }
  }

  onInvalidChange(value) {
    this.shadowRoot.querySelector('#error-text').innerHTML = this.invalid
      ? `<iron-icon icon="error"></iron-icon> <div> ${ this.hasAttribute('error-text') ? this.getAttribute('error-text') : ''} </div>`
      : ''
  }

  onDiscrepancyChange(value) {
    this.shadowRoot.querySelector('#discrepancy-text').innerHTML = this.hasDiscrepancy
      ? `<iron-icon icon="flag"></iron-icon> <div> ${ this.hasAttribute('discrepancy-text') ? this.getAttribute('discrepancy-text') : ''} </div>`
      : ''
  }

  onWarnChange(value) {
    this.shadowRoot.querySelector('#warn-text').innerHTML = this.hasWarning
      ? `<iron-icon icon="warning"></iron-icon> <div> ${ this.hasAttribute('warn-text') ? this.getAttribute('warn-text') : ''} </div>`
      : ''
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

  onSkippedChange(newValue) {
    if (newValue === true) {
      this.value = this.constructor.properties.value.value
      this.render()
    }
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
