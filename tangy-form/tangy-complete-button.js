import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import './util/html-element-props.js'
import './style/tangy-element-styles.js';
import './style/tangy-common-styles.js'
/**
 * `tangy-complete-button`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class TangyCompleteButton extends PolymerElement {
  static get template() {
    return html`
    <style include="tangy-common-styles"></style>
    <style>
      
      :host([hidden]) {
        display: none;
      }
      
     
      :host([required]:not([disabled])) label::before  { 
        content: "*"; 
        color: red; 
        position: absolute;
        top: 4px;
        right: 5px;
      }
      .text-outer {
        position: relative;
        height: 100%;
      }
      .text-inner {
        /*
        position: absolute;
        top: 20px;
        left: 20px;
        height: 30%;
        /*width: 50%;
        margin: -15% 0 0 -25%;*/
      }
      .text-inner ::slotted(*) {
      }
      
    </style>
    <paper-button id="button">
      <slot></slot>
    </paper-button>
      
`;
  }

  static get is() { return 'tangy-complete-button'; }
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
        observer: 'onDisabledChange',
        reflectToAttribute: true
      },
      goHome: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.completePressed.bind(this))
  }

  completePressed() {
    if (this.goHome) window.location.href = './index.html'
    if (this.disabled) return
    if (this.value == '') {
      this.value = 'on'
    } else {
      this.value = ''
    }
  }

  onDisabledChange(newState, oldState) {
    this.$.button = this.disabled 
  }
  onValueChange(newState, oldState) {
    if (newState == '') {
      this.pressed = false
    } else {
      this.pressed = true
    }
  }
}

window.customElements.define(TangyCompleteButton.is, TangyCompleteButton);
