import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

    /**
     * `tangy-code`
     *
     *
     * @customElement
     * @polymer
     * @demo demo/index.html
     */
export class TangyCode extends PolymerElement {
  static get template () {
    return html`
      <div id="container"></div>
    `
  }

  static get is () {
    return 'tangy-code'
  }

  static get properties () {
    return {
      name: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      required: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      hidden: {
        type: Boolean,
        value: false,
        observer: 'render',
        reflectToAttribute: true
      },
      value: {
        type: String,
        value: ''
      },
      invalid: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      mode: {
        type: String,
        value: '',
        observer: 'render',
        reflectToAttribute: true
      },
      height: {
        type: Number,
        value: 600,
        observer: 'render',
        reflectToAttribute: true
      }
    }
  }

  render() {
    this.$.container.innerHTML = `
      <juicy-ace-editor mode="${this.mode}" style="height: ${this.height}px;">
      </juicy-ace-editor>
    `
    this.shadowRoot.querySelector('juicy-ace-editor').value = this.innerHTML
    this.value = this.innerHTML
    this.shadowRoot.querySelector('juicy-ace-editor').addEventListener('change', (event) => {
      this.value = event.target.value
    })
  }


  validate() {
    if (this.shadowRoot.querySelector('juicy-ace-editor').shadowRoot.querySelector('.ace_error')) {
      this.invalid = true
      return false
    } else {
      this.invalid = false
      return true
    }
  }

}
window.customElements.define(TangyCode.is, TangyCode)
