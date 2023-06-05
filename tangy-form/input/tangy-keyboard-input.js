import { html, css } from 'lit';
import '../util/html-element-props.js'
import '../style/tangy-common-styles.js'
import '../style/tangy-element-styles.js'
import { TangyInputLitBase } from '../tangy-input-lit-base.js'

    /**
     * `tangy-keyboard-input`
     *
     *
     * @customElement
     * @polymer
     * @demo demo/index.html
     */
export class TangyKeyboardInput extends TangyInputLitBase {

  static get styles() {
    return [
      css`
        #erase {
          padding: 0.375rem 0.75rem;
        }
        .btn {
          display: inline-block;
          font-weight: 400;
          text-align: center;
          vertical-align: middle;
          user-select: none;
          padding: 0;
          margin: 0.4rem;
          font-family: 'Andika', sans-serif;
          line-height: 1.5;
          border-radius: 0.5rem;
          color: #2a3f55;
          border: 1px solid #ffbf09;
          text-decoration: none;
          box-shadow: 0px 1px 6px 3px #ffaa004d;
          background-color: #ffbf09;
          transition-duration: 0.4s;
          position: relative;
          font-size: 2.7rem;
          width: 4rem;
          height: 4rem;
        }
        .btn:after {
          content: "";
          display: block;
          position: absolute;
          border-radius: 4em;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: all 0.5s;
          box-shadow: 0 0 10px 40px #ffaa004d;
        }
        .btn:active:after {
          box-shadow: 0 0 0 0 #ffaa004d;
          position: absolute;
          border-radius: 4em;
          left: 0;
          top: 0;
          opacity: 1;
          transition: 0s;
        }
        #qnum-content {
          width: 80vw;
          /*height: 90vh;*/
          display: flex;
          flex-direction: column;
        }
        .keys {
          margin-left: -5vw;
          margin-right: -5vw;
          text-align: center;
          display: block;
        }
        #input-container {
          background-color: #fff;
          border-radius: 1rem;
          padding: 4rem 1.2rem;
          font-size: 4rem;
          font-weight: 700;
          text-align: center;
          flex-grow: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-transform: lowercase;
          margin-top: 1rem;
          margin-bottom: 1rem;
          letter-spacing: .4rem;
          position: relative;
          min-height: 1.5em;
        }
        #erase {
          position: absolute;
          right: 1rem;
          top: 1rem;
        }
        .flex-container {
          /* min-height: 100vh; */
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-family: 'Andika', sans-serif;
          font-size: 1.3rem;
          font-weight: 400;
          line-height: 1.5;
          margin: 0;
          color: #212121;
          background-size: cover;
          background-attachment: fixed;
          background-repeat: no-repeat;
        }
        #bottom-spacer {
          height: var(--bottom-spacer-height);
        }

        @keyframes highlight {
          0% {
            background: yellow
          }
          100% {
            background: none;
          }
        }

        .highlight {
          animation: highlight 1s;
        }
        #error-text {
          color:red;
          font-size: smaller;
          text-transform:none;
          letter-spacing:normal;
        }
        iron-icon.larger {
          height: 40px;
          width: 40px;
        }
      `
    ]
  }

  render () {
    return html`
      <style include="tangy-common-styles"></style>
      <style include="tangy-element-styles"></style>
      <style>
        :host {
          --tangy-element-border: 0;
        }
      </style>
      <div class="flex-container">
        ${this.questionNumber ? html`
          <div id="qnum-number">
            <label>${this.questionNumber}</label>
          </div>
        ` : ''}
        <div id="qnum-content">
          <label>${this.label}</label>
          <div id="keyboard">
            <div id="top-keyboard">
              <div class="keys">
              ${this.topKeyboard.map(character => html`
                <button class="btn" @click="${() => this.onKeyClick(character)}">${character}</button>
              `)}
            </div>
          </div>
          <div id="input-container">
            <div id="input-value">
              ${this.prefix}<span id="inputValue">${this.value}</span>${this.postfix}
            </div>
            <button id="erase" class="btn" @click="${() => this.onErasureKeyClick()}">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve">
                <path d="M89.3,32.7l-24-24c-0.4-0.4-0.9-0.6-1.4-0.6s-1,0.2-1.4,0.6L28.5,42.6l26.9,26.9l33.9-33.9c0.4-0.4,0.6-0.9,0.6-1.4   C89.9,33.6,89.7,33.1,89.3,32.7z M60.3,26.3L41.9,44.7c-0.4,0.4-0.9,0.6-1.4,0.6c-0.5,0-1-0.2-1.4-0.6c-0.8-0.8-0.8-2.1,0-2.8   l18.4-18.4c0.8-0.8,2-0.8,2.8,0C61.1,24.3,61.1,25.5,60.3,26.3z" fill="#726f63"></path>
                <path d="M20.1,79.8c0-1.1-0.9-2-2-2h-6c-1.1,0-2,0.9-2,2s0.9,2,2,2h6C19.2,81.8,20.1,80.9,20.1,79.8z" fill="#726f63"></path>
                <path d="M22.8,84.3l-4.2,4.2c-0.8,0.8-0.8,2,0,2.8c0.4,0.4,0.9,0.6,1.4,0.6s1-0.2,1.4-0.6l4.2-4.2c0.8-0.8,0.8-2,0-2.8   C24.9,83.5,23.6,83.5,22.8,84.3z" fill="#726f63"></path>
                <path d="M83.1,73.8H51l1.5-1.5L25.7,45.4l-9.9,9.9c-2.3,2.3-2.3,6.1,0,8.5l13.5,13.4c0.4,0.4,0.9,0.6,1.4,0.6h52.5c1.1,0,2-0.9,2-2   C85.1,74.7,84.2,73.8,83.1,73.8z" fill="#ff620a" class="tangerine"></path>
              </svg>
            </button>
            ${this.hintText ? html`}
            <div id="hint-text" class="hint-text">${this.hintText}</div>
          ` : ''}
            ${this.invalid ? html`
            <div id="error-text" >
              <iron-icon icon="error" class="larger"></iron-icon> <div> ${ this.hasAttribute('error-text') ? this.getAttribute('error-text') : ''} </div>
            </div>
          ` : ''}
            ${this.hasWarning ? html`
            <div id="warn-text"></div>
              <iron-icon icon="warning"></iron-icon> <div> ${this.warnText || ''} </div>
          ` : ''}
            ${this.hasDiscrepancy ? html`
            <div id="discrepancy-text">
              <iron-icon icon="flag"></iron-icon> <div> ${this.discrepancyText || ''} </div>
            </div>
          ` : ''}
          </div>
          <div id="bottom-keyboard">
            ${this.bottomKeyboard.map(character => html`
              <button class="btn" @click="${() => this.onKeyClick(character)}">${character}</button>
            `)}
          </div>
            <div id="bottom-spacer"></div>
          </div>
        </div>
      </div>
    `
  }

  constructor() {
    super()
    this.keys = 'a b c d e f g h i j k l m n o p q r s t u v w x y z'
    this.prefix = ''
    this.postfix = ''
    this.value = ''
    this.keyboardAlign = 'top'
    this.bottomKeyboard = []
    this.topKeyboard = []
  }
  
  static get is () {
    return 'tangy-keyboard-input'
  }

  static get properties () {
    return {
      prefix: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      postfix: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      keys: {
        type: String,
        value: 'a b c d e f g h i j k l m n o p q r s t u v w x y z',
        reflectToAttribute: true
      },
      keyboardAlign: {
        type: String,
        value: 'top',
        reflectToAttribute: true
      },
      topKeyboard: {
        type: Array,
        value: [],
        reflectToAttribute: true
      },
      bottomKeyboard: {
        type: Array,
        value: [],
        reflectToAttribute: true
      },
      name: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      questionNumber: {
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
        reflectToAttribute: true
      },
      hintText: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      hasWarning: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      hasDiscrepancy: {
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
      skipped: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      value: {
        type: String,
        value: '',
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
    if (this.keyboardAlign === 'top') {
      this.topKeyboard = this.keys.split(' ')
    } else {
      this.bottomKeyboard = this.keys.split(' ')
    }
  }

  onKeyClick (character) {
    this.value += character
    this.shadowRoot.querySelector('#inputValue').classList.add('highlight');
    const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))
    sleep(500).then(() => {
      this.shadowRoot.querySelector('#inputValue').classList.remove('highlight');
    })
  }

  onErasureKeyClick () {
    this.value = this.value.slice(0, -1)
  }

  applyLabel(label) {
    this.$.checkbox.children['checkbox-text'].innerHTML = this.label 
  }

  onDisabledChange(value) {
    if (value === false) {
      this.$.keyboard.removeAttribute('disabled')
    } else {
      this.$.keyboard.setAttribute('disabled', 'true')
    }
  }

  validate() {
    if (this.required === true && 
        this.value === '' ) {
      this.invalid = true
      return false
    } else {
      this.invalid = false
      return true
    }
  }

}
window.customElements.define(TangyKeyboardInput.is, TangyKeyboardInput)
