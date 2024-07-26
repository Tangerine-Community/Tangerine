import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-input/paper-textarea.js'
import '@polymer/polymer/lib/elements/dom-if.js';
import '../style/tangy-common-styles.js'
import '../style/tangy-element-styles.js'
import '@polymer/iron-icon/iron-icon.js'
import '@polymer/iron-icons/image-icons.js'
import { t } from '../util/t.js'
import { TangyInputBase } from '../tangy-input-base.js'

/**
 * `tangy-consent`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class TangyConsent extends TangyInputBase {
  static get template() {
    return html`
      <style include="tangy-common-styles"></style>
      <style include="tangy-element-styles"></style>
      <style>
        :host {
          display: block;
        }
        
        #canvas {
          width:100%;
          border-color: black;
          border-style: solid;
          border-width: 0px;
        }
        :host([just-found-data]) #canvas {
          border-color: red;
        }
        :host([hide-output]) #output {
          display:none;
        }
        label {
          display: block;
          font-size: 1.2em;
          margin-bottom: 15px;
          color: var(--primary-text-color);
          margin-bottom: 15px;
        }
        #scan-icon, #container, #canvans {
          display: inline-block;
          width: 100%;
          height: 100%;
        }
        paper-button.pressed {
          background-color: var(--primary-color) !important;
        }
        #statusMessage {
          margin-top: 1em;
          font-weight: bold;
          color: red;
        }
        paper-card {
          margin-bottom: 10px;
        }
      </style>
      <div class="flex-container m-y-25">
        <div id="qnum-number"></div>
        <div id="qnum-content">
          <paper-card>
            <div class="card-content">
              <div id="container">
                <span id="prompt"></span>
                <div id="statusMessage"> [[statusMessage]] </div>
                <label class="hint-text">
                </label>
              </div>
            </div>
            <div class="card-actions">
                <paper-button id="consentYesButton" on-click="clickedConsentYes">{{t.consent_yes}}</paper-button>
                <paper-button id="consentNoButton" on-click="clickedConsentNo">{{t.consent_no}}</paper-button>
            </div>
          </paper-card>
          <div id="error-text"></div>
          <div id="warn-text"></div>
          <div id="discrepancy-text"></div>
        </div>
      </div>
  `;
  }

  static get is() { return 'tangy-consent'; }
  static get properties() {
    return {
      name: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      value: {
        type: String,
        value: '',
        reflectToAttribute: true,
        observer: 'onValueChange'
      },
      disabled: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      required: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      prompt: {
        type: String,
        value: 'Does the child consent?',
        observer: 'onPromptChange',
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
      hintText: {
        type: String,
        value: '',
        observer: 'onHintTextChange',
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
      skipped: {
        type: Boolean,
        value: false,
        observer: 'onSkippedChange',
        reflectToAttribute: true
      },
      identifier: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      confirmNo: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.t = {
      'consent': t('Does the child consent?'),
      'consent_yes': t('yes, continue'),
      'consent_no': t('no, stop'),
      'message_yes': t('You marked Yes'),
      'message_no': t('You marked No'),
      'confirm_no': t('Please confirm that you marked No.')
    }
    // this.addEventListener('click', this.inputPressed.bind(this))
    this.shadowRoot.querySelector('#qnum-number').innerHTML = this.hasAttribute('question-number') 
      ? `<label>${this.getAttribute('question-number')}</label>`
      : ''
  }


  onHintTextChange(value) {
    this.shadowRoot.querySelector('.hint-text').innerHTML = value ? value : ''
  }

  onPromptChange(value) {
    this.shadowRoot.querySelector('#prompt').innerHTML = value ? value : ''
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

  clickedConsentYes() {
    this.value = 'yes'
  }

  clickedConsentNo() {
    if (this.confirmNo) {
      if (confirm(this.t.confirm_no) == true) {
        this.value = 'no'
      }
    } else {
      this.value = 'no'
    }
  }

  inputPressed() {
    if (this.disabled) return
    if (this.value == '') {
      this.value = 'on'
    } else {
      this.value = ''
    }
  }

  onValueChange(value) {

    let controlElements = [].slice.call(this.shadowRoot.querySelectorAll('paper-button'))
    controlElements.forEach(element => element.classList.remove('pressed'))

    switch (value) {
      case "yes":
        this.statusMessage = this.t.message_yes;
        this.$.consentYesButton.classList.add('pressed')
        break
      case "no":
        this.statusMessage = this.t.message_no;
        this.$.consentNoButton.classList.add('pressed')
        this.dispatchEvent(new CustomEvent('TANGY_INPUT_CONSENT_NO', {bubbles: true}))
        break
    }
  }

  validate() {
    if (this.required && !this.value) {
      this.setAttribute('invalid', '')
      return false
    } else {
      this.removeAttribute('invalid')
      return true
    }
  }

  onSkippedChange(newValue, oldValue) {
    if (newValue === true) {
      this.value = this.constructor.properties.value.value
    }
  }

}

window.customElements.define(TangyConsent.is, TangyConsent);
