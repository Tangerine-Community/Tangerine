import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { t } from '../util/t.js'
import { TangyInputBase } from '../tangy-input-base.js'
import '../util/html-element-props.js'
import '@polymer/paper-input/paper-textarea.js'
import '@polymer/paper-input/paper-input.js'
import '../style/tangy-common-styles.js'
import '../style/tangy-element-styles.js'
import { combTranslations } from 'translation-web-component/util.js'

/**
 * `tangy-input`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class TangyInput extends TangyInputBase {

  static get template() {
    return html`
    <style include="tangy-common-styles"></style>
    <style include="tangy-element-styles"></style>
    <style>
      paper-input, paper-textarea {
        --paper-input-container-shared-input-style_-_font-size: 1em;
        --paper-font-subhead_-_font-size: 1em;
        --paper-font-subhead_-_line-height: 1em;
      }
      :host([invalid]) #hintText {
        position: relative;
        top: 5px;
      }

    </style>
    <div class="flex-container m-y-25">
      <div id="qnum-number"></div>
      <div id="qnum-content">
        <div id="container"></div>
      </div>
    </div>
    <div id="error-text"></div>    
    <div id="warn-text"></div>
    <div id="discrepancy-text"></div>
  `
  }

  static get is() { return 'tangy-input'; }

  static get properties() {
    return {
      name: {
        type: String,
        value: ''
      },
      private: {
        type: Boolean,
        value: false
      },
      label: {
        type: String,
        observer: 'reflect',
        value: ''
      },
      innerLabel: {
        type: String,
        observer: 'reflect',
        value: ''
      },
      placeholder: {
        type: String,
        observer: 'reflect',
        value: ''
      },
      hintText: {
        type: String,
        observer: 'reflect',
        value: ''
      },
      type: {
        type: String,
        observer: 'reflect',
        value: ''
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
      invalid: {
        type: Boolean,
        value: false,
        observer: 'onInvalidChange',
        reflectToAttribute: true
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
      value: {
        type: String,
        value: '',
        observer: 'reflect',
        reflectToAttribute: true
      },
      min: {
        type: String,
        value: '',
        observer: 'reflect',
        reflectToAttribute: true
      },
      max: {
        type: String,
        value: '',
        observer: 'reflect',
        reflectToAttribute: true
      },
      questionNumber: {
        type: String,
        value: '',
        observer: 'reflect',
        reflectToAttribute: true
      },
      errorText: {
        type: String,
        value: '',
        observer: 'reflect',
        reflectToAttribute: true
      },
      // allowedPattern and errorMessage are for passing down to paper-input's API of the same name. We are probably going to drop this usage in favor of the tangy API of valid-if and error-text. Consider these items deprecated.
      allowedPattern: {
        type: String,
        value: '',
        observer: 'reflect',
        reflectToAttribute: true
      },
      errorMessage: {
        type: String,
        observer: 'reflect',
        value: ''
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

  connectedCallback() {
    super.connectedCallback()
    // Template.
    this.$.container.innerHTML = `   
      <label id="label"></label>
      <label id="hintText" class="hint-text"></label>
      ${
        this.getAttribute('type') === 'email' ||
        this.getAttribute('type') === 'number' ||
        this.getAttribute('type') === 'date' ||
        this.getAttribute('type') === 'time' ||
        this.getAttribute('allowed-pattern')
        ? `<paper-input id="input"></paper-input>`
        : `<paper-textarea id="input"></paper-textarea>`
      }
    `
    // Listen for user changes.
    this.shadowRoot.querySelector('#input').addEventListener('value-changed', (event) => {
      // Prevent infinite loops because this event is triggered by reflecting a value change.
      if (this.justReflectedValue) {
        this.justReflectedValue = false
        return
      }
      // Now it's safe to set this.value.
      this.value = event.target.value
      let incomplete = (event.target.value === '') ? true : false
      this.dispatchEvent(new Event('change', {
        detail: {
          inputName: this.name,
          inputValue: event.target.value,
          inputIncomplete: incomplete,
          inputInvalid: !this.shadowRoot.querySelector(`#input`).validate()
        },
        bubbles: true
      }))
    })
    this.ready = true
    this.reflect()

  }

  reflect() {
    if (!this.ready) return
    if (!this.shadowRoot.querySelector('#input')) return
    // Reflect data into DOM.
    if (this.hasAttribute('disabled') && this.hasAttribute('invalid')) {
      this.removeAttribute('invalid')
      this.shadowRoot.querySelector('#input').removeAttribute('invalid')
    } 
    this.$['qnum-number'].innerHTML = `<label>${this.questionNumber}</label>`;
    this.shadowRoot.querySelector('#hintText').innerHTML = this.hintText
    this.shadowRoot.querySelector('#label').innerHTML = this.label
    this.shadowRoot.querySelector('#input').placeholder = combTranslations(this.placeholder)
    this.shadowRoot.querySelector('#input').label = this.innerLabel === '' 
      ? t('Enter your response to above question here') 
      : combTranslations(this.innerLabel)
    this.shadowRoot.querySelector('#input').errorMessage = combTranslations(this.errorMessage)

    this.shadowRoot.querySelector('#input').allowedPattern = this.allowedPattern
    this.shadowRoot.querySelector('#input').setAttribute('type', this.type ? this.type : 'text')
    // When comparing the values, make sure they are always strings as opposed to different kinds of untruthiness.
    const cleanOuterValue = this.value
      ? this.value
      : ''
    const cleanInnerValue = this.shadowRoot.querySelector('#input').value
      ? this.shadowRoot.querySelector('#input').value
      : ''
    if (cleanOuterValue !== cleanInnerValue || this.shadowRoot.querySelector('#input').value === undefined) {
      // Prevent infinite loops with this semaphore which will be caught by the value-changed listener above.
      this.justReflectedValue = true
      this.shadowRoot.querySelector('#input').value = this.value
    }
    this.shadowRoot.querySelector('#input').setAttribute('min', this.min)
    this.shadowRoot.querySelector('#input').setAttribute('max', this.max)
    if (this.required === false) {
      this.shadowRoot.querySelector('#input').removeAttribute('required')
    } else {
      this.shadowRoot.querySelector('#input').setAttribute('required', true)
    }
    if (this.disabled === false) {
      this.shadowRoot.querySelector('#input').removeAttribute('disabled')
    } else {
      this.shadowRoot.querySelector('#input').setAttribute('disabled', true)
    }
  }

  onInvalidChange(value) {
    if (this.shadowRoot.querySelector('#error-text')) {
      this.shadowRoot.querySelector('#error-text').innerHTML = this.invalid
        ? `<iron-icon icon="error"></iron-icon> <div> ${ this.hasAttribute('error-text') ? this.getAttribute('error-text') : ''} </div>`
        : ''
    }
  }
  
  onDiscrepancyChange(value) {
    if (this.shadowRoot.querySelector('#discrepancy-text')) {
      this.shadowRoot.querySelector('#discrepancy-text').innerHTML = this.hasDiscrepancy
        ? `<iron-icon icon="flag"></iron-icon> <div> ${ this.hasAttribute('discrepancy-text') ? this.getAttribute('discrepancy-text') : ''} </div>`
        : ''
    }
  }

  onWarnChange(value) {
    if (this.shadowRoot.querySelector('#warn-text')) {
      this.shadowRoot.querySelector('#warn-text').innerHTML = this.hasWarning
        ? `<iron-icon icon="warning"></iron-icon> <div> ${ this.hasAttribute('warn-text') ? this.getAttribute('warn-text') : ''} </div>`
        : ''
    }
  }



  validate() {
    if (this.hasAttribute('disabled') || this.hasAttribute('hidden')) {
      this.removeAttribute('invalid')
      return true
    } else {
      if (this.shadowRoot.querySelector('#input').validate()) {
        this.removeAttribute('invalid')
        return true
      } else {
        this.setAttribute('invalid', '')
        return false
      }
    }
  }

  onSkippedChange(newValue, oldValue) {
    if (newValue === true) {
      this.value = this.constructor.properties.value.value
    }
  }

}
window.customElements.define(TangyInput.is, TangyInput);
