import { html } from '@polymer/polymer/polymer-element.js';
import '../util/html-element-props.js'
import '@polymer/paper-radio-button/paper-radio-button.js'
import '../style/tangy-common-styles.js'
import '../style/tangy-element-styles.js'
import { TangyInputBase } from '../tangy-input-base.js'

    /**
     * `tangy-radio-block`
     *
     *
     * @customElement
     * @polymer
     * @demo demo/index.html
     */
export class TangyRadioBlock extends TangyInputBase {
  static get template () {
    return html``
  }

  static get is () {
    return 'tangy-radio-block'
  }

  static get properties () {
    return {
      hideButton: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      name: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      label: {
        type: String,
        value: '',
        observer: 'render',
        reflectToAttribute: true
      },
      required: {
        type: Boolean,
        value: false,
        observer: 'render',
        reflectToAttribute: true
      },
      disabled: {
        type: Boolean,
        value: false,
        observer: 'render',
        reflectToAttribute: true
      },
      invalid: {
        type: Boolean,
        value: false,
        observer: 'render',
        reflectToAttribute: true
      },
      incomplete: {
        type: Boolean,
        value: true,
        reflectToAttribute: true
      },
      hintText: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      hidden: {
        type: Boolean,
        value: false,
        observer: 'render',
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
        observer: 'render',
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
    this.render()
  }

  render() {
    this.shadowRoot.innerHTML = `    
      <style include="tangy-common-styles"></style>
      <style include="tangy-element-styles"></style>
      <style>
        .hint-text {
            color: gray;
            font-size: 0.8rem;
            font-weight: lighter;
        }
        .toggle {
          position: absolute;
          clip: rect(0,0,0,0);
          pointer-events: none;
        }
        .toggle:active + label, .toggle:checked + label {
          /* Old selected orange color: #ff620c */
          border-color: var(--button-selected-border-color, green);
        }
        .btn-lg {
          width: var(--width, 6.5rem);
          height: var(--height, 6.5rem);
          display: flex;
          align-items: center;
          justify-content: var(--justify-content, center);
          font-size: 2rem !important;
          margin: 0 0.25rem;
        }
        .btn {
          font-weight: 400;
          text-align: center;
          vertical-align: middle;
          user-select: none;
          padding: 0.375rem 0.75rem;
          font-family: 'Andika', sans-serif;
          font-size: 1.3rem;
          line-height: 1.5;
          border-radius: 0.5rem;
          color: #2a3f55;
          border: 7px solid #ffbf09;
          text-decoration: none;
          box-shadow: 0px 1px 6px 3px #ffaa004d;
          background-color: #ffbf09;
          transition-duration: 0.4s;
          position: relative;
          box-sizing: border-box;
      }
      </style>
      <input 
        ${this.required ? 'required' : ''}
        ${this.invalid ? 'invalid' : ''}
        ${this.disabled ? 'disabled' : ''}
        ${this.hidden ? 'hidden' : ''}
        ${this.value ? 'checked' : ''}
        id="a1"
        class="toggle"
        type="radio"
        name="answer"
      >
      </input>
      <label for="a1" class="btn btn-lg">
        ${this.label ? this.label : this.innerHTML}
      </label>
      ${this.hasAttribute('hint-text') ? `
        <label class="hint-text">
          ${this.getAttribute('hint-text')}
        </label>
      ` : ''}
    `
    this.shadowRoot.querySelector('input').addEventListener('change', (e) => {
      e.stopPropagation()
      let incomplete = (!e.target.checked)
      this.value = e.target.checked ? 'on' : ''
      this.dispatchEvent(new CustomEvent('change', { bubbles: true }))
      // @TODO Deprecated API. Remove ready?
      this.dispatchEvent(new CustomEvent('INPUT_VALUE_CHANGE', {
        bubbles: true,
        detail: {
          inputName: this.name,
          inputValue: e.target.hasAttribute('checked'),
          inputIncomplete: incomplete,
          inputInvalid: false 
        }
      }))
    })
  }

  onSkippedChange(newValue, oldValue) {
    if (newValue === true) {
      this.value = this.constructor.properties.value.value
    }
  }

}
window.customElements.define(TangyRadioBlock.is, TangyRadioBlock)
