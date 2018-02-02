import {Element} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../tangy-form/tangy-element-styles.js';
/**
 * `tangy-toggle-button`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class TangyToggleButton extends Element {
  static get template() {
    return `
    <style>
      :host {
        display: inline-block;
        border: solid 3px #777;
        border-radius: 10px;
        padding: 0 15px;
        color: #777;
        font-size: 1em;
      }
      :host([hidden]) {
        display: none;
      }
      :host([pressed]) {
        background-color: #3c5b8d;;
        color: #FFF;
        background-image: url('data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>');
        background-repeat: no-repeat;
        background-position: top left; 
      }
      
      :host([highlighted]) {
        border-color: #f26f10;
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
    <div class="text-outer">
      <div class="text-inner">
        <slot></slot>
      </div>
    </div>
`;
  }

  static get is() { return 'tangy-toggle-button'; }
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
      highlighted: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      pressed: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.togglePressed.bind(this))
  }

  togglePressed() {
    if (this.disabled) return
    if (this.value == '') {
      this.value = 'on'
    } else {
      this.value = ''
    }
  }

  onValueChange(newState, oldState) {
    if (newState == '') {
      this.pressed = false
    } else {
      this.pressed = true
    }
  }
}

window.customElements.define(TangyToggleButton.is, TangyToggleButton);
