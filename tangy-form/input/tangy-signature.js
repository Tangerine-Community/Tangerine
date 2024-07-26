import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import SignaturePad from 'signature_pad'
import { t } from '../util/t.js'
import '../style/tangy-common-styles.js'
import '../style/tangy-element-styles.js'
import '@polymer/iron-icon/iron-icon.js'
import '@polymer/paper-button/paper-button.js'
import { TangyInputBase } from '../tangy-input-base.js'


/**
 * `tangy-checkbox`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class TangySignature extends TangyInputBase {
  static get template() {
    return html`
  <style include="tangy-common-styles"></style>
  <style include="tangy-element-styles"></style>
  <style>
   img {
    width: 100%;
   }
   .hint-text{ s
    margin-top:6px;
    margin-left:4px;
   }

   #signature-pad {
     border-color: #CCC;
     border-width: 15px;
     border-radius: 5px;
     border-style: dashed;
     width: 600px;
     height: 300px;
   }

  :host(:not([show-pad])) #signature-pad {
     display:none; 
   }
 
   :host([show-pad]) #signature-pad {
     display: block;
   }
   #signature-rendered {
     border-color: #CCC;
     border-width: 15px;
     border-radius: 5px;
     border-style: solid;
     width: 600px;
     height: 300px;
      display: none;
    }
    :host(show-pad) #signature-rendered {
      display: none !important;
    }
    :host(:not([show-pad])) #signature-rendered {
      display: inline;
    }
    #buttons {
      margin: 15px 0px;
    }
    paper-button {
      background-color: var(--accent-color, #CCC);
    }
    paper-button[disabled] {
      opacity: .2;
    }
  </style>

  <div class="flex-container m-y-25">
    <div id="qnum-number"></div>
    <div id="qnum-content">
      <label id="label"></label>
      <span id="signature-pad">
        <canvas id="signature-pad-canvas" width=600 height=300></canvas>
      </span>
      <img src="[[value]]" id="signature-rendered">
      <div id="buttons">
        <paper-button id="accept-button" on-click="captureSignature"><iron-icon icon="done"></iron-icon> [[t.accept]] </paper-button>
        <paper-button id="clear-button" on-click="clearSignature"><iron-icon icon="delete"></iron-icon> [[t.clear]] </paper-button>
      </div>
      <label class="hint-text"></label>
      <label id="error-text"></label>
    </div>
  </div>
  
  `
  }

  static get is() {
    return 'tangy-signature'
  }

  static get properties() {
    return {
      name: {
        type: String,
        value: ''
      },
      hintText: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      label: {
        type: String,
        observer: 'reflect',
        value: ''
      },
      errorText: {
        type: String,
        value: ''
      },
      private: {
        type: Boolean,
        value: false
      },
      disabled: {
        type: Boolean,
        value: false,
        observer: 'onDisabledChange',
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
      incomplete: {
        type: Boolean,
        value: true,
        reflectToAttribute: true
      },
      value: {
        type: String,
        value: '',
        observer: 'onValueChange'
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
  }

  ready() {
   super.ready();
   this.t = {
     accept: t('accept'),
     clear: t('clear')
   }
   const canvas = this.shadowRoot.querySelector("#signature-pad-canvas");
   this.signaturePad = new SignaturePad(canvas, {
     backgroundColor: 'rgb(255, 255, 255)'
   });
   this.shadowRoot.querySelector('.hint-text').innerHTML = this.hasAttribute('hint-text') 
    ? this.getAttribute('hint-text')
    : ''
  this.shadowRoot.querySelector('#qnum-number').innerHTML = this.hasAttribute('question-number') 
    ? `<label>${this.getAttribute('question-number')}</label>`
    : ''
  this.shadowRoot.querySelector('#label').innerHTML = this.label
  }

  captureSignature() {
    if (this.signaturePad.isEmpty() && !this.hasAttribute('allow-blank')) {
      return alert(t('Please provide a signature first.'));
    }
    this.value = this.signaturePad.toDataURL('image/jpeg');
  }

  clearSignature() {
    this.value = ''
    this.signaturePad.clear()
  }

  onValueChange() {
    if (this.value) {
      this.removeAttribute('show-pad')
      this.shadowRoot.querySelector('#accept-button').setAttribute('disabled', '')
    } else {
      this.setAttribute('show-pad', '')
      this.shadowRoot.querySelector('#accept-button').removeAttribute('disabled')
    }
  }

  onInvalidChange(value) {
    this.shadowRoot.querySelector('#error-text').innerHTML = this.invalid
      ? `<iron-icon icon="error"></iron-icon> <div> ${ this.hasAttribute('error-text') ? this.getAttribute('error-text') : ''} </div>`
      : ''
  }

  validate() {
    if (this.hasAttribute('required') && !this.value) {
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
window.customElements.define(TangySignature.is, TangySignature)
