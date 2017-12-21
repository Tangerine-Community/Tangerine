/* jshint esversion: 6 */

import {Element as PolymerElement} from '../../node_modules/@polymer/polymer/polymer-element.js'
// import '../tangy-form/tangy-element-styles.js'

/**
 * `tangy-acasi`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class TangyAcasi extends PolymerElement {
  static get template () {
    return `
    <style include="tangy-element-styles"></style>

    <style>
      paper-radio-button {
        margin-right: 25px;
        --paper-radio-button-size: 2em;
      }
      .eftouch-selected {
        border: 10px solid #af0;
        border-radius: 10px;
      }
    </style>

    <div class="container">
      <label for="group">[[label]]</label>
      <paper-radio-group name="group" id="paper-radio-group">
      </paper-radio-group>
    </div>
    `
  }

  static get is () {
    return 'tangy-acasi'
  }

  static get properties() {
    return {
      name: {
        type: String,
        value: ''
      },
      value: {
        type: String,
        value: '',
        reflectToAttribute: true,
        observer: 'onValueChange'
      },
      required: {
        type: Boolean,
        value: false
      },
      disabled: {
        type: Boolean,
        value: false,
        observer: 'onDisabledChange',
        reflectToAttribute: true
      },
      label: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      hidden: {
        type: Boolean,
        value: false,
        observer: 'onHiddenChange',
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
      // name: {
      //   type: String,
      //   value: 'Click start to begin'
      // },
      // statusmessage: {
      //   type: String,
      //   value: 'Click start to begin'
      // },
      display_sound_url: {
        type: String,
        value: '/content/assets/sounds/pop.mp3'
      },
      transition_sound_url: {
        type: String,
        value: '/content/assets/sounds/swish.mp3'
      }
    };
  }


  // Element class can define custom element reactions
  // @TODO: Duplicating ready?
  connectedCallback() {
    super.connectedCallback();
    this.isReady = false
    let paperRadioGroupEl = this.shadowRoot.querySelector('paper-radio-group')
    paperRadioGroupEl.addEventListener('change', this.onPaperRadioGroupChange.bind(this), false)
    // Populate options as paper-radio-button elements
    let options = this.querySelectorAll('img')
    for (let option of options) {
      let button = document.createElement('paper-radio-button')
      button.name = option.alt
      if (this.disabled) button.setAttribute('disabled', true)
      button.innerHTML = option.outerHTML
      paperRadioGroupEl.appendChild(button)
    }
    paperRadioGroupEl.selected = this.value
    if (this.required) paperRadioGroupEl.required = true
    this.isReady = true
  }

  ready() {
    super.ready();
    // this.status = this.statusmessage;
    this.ds = this.display_sound_url;
    this.ts = this.transition_sound_url;
    console.log("display_sound_url: " + this.display_sound_url);
    console.log("transition_sound_url: " + this.transition_sound_url);
    if (this.transition_sound_url) {
      this.transitionSound = new Audio(this.transition_sound_url);
      this.transitionSound.play();
    }
    this.transitionSound.play();
    if (this.display_sound_url) {
      this.displaySound = new Audio(this.display_sound_url);
      this.displaySound.load();
    }


    // @TODO: Need to listen to slot for ready.
    setTimeout(() => this._prepareForm(), 200)
  }

  _prepareForm() {

    // Find all our img elements.
    this.imgElements = Array.prototype.slice.call(this.shadowRoot.querySelectorAll('img'));
    this.imgElements.forEach(element => {
      element.addEventListener('click', (event) => {
        this.imgElements.forEach(element => {
//                element.setAttribute('style', 'border: none;'); ;
//                TangyUtils.removeClass(element, 'eftouch-selected');
          var ele = element;
          var cls = 'eftouch-selected';
          var hasClass = !!ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'))
          if (hasClass) {
            var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
            ele.className=ele.className.replace(reg,' ');
          }



        });
        const element = event.srcElement;
//            element.setAttribute('style', 'border: 10px solid #af0; border-radius: 10px;'); ;
        var ele = element;
        var cls = 'eftouch-selected';
        var hasClass = !!ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'))
        if (!hasClass) ele.className += " "+cls;

        const inputEl = this.querySelector('#foo');
        if (inputEl !== null) {
          inputEl.value = event.srcElement.id;
        }
        this.displaySound.play();
//            this.statusmessage = 'You may now proceed.';
      });
    });

  }

  onPaperRadioGroupChange(event) {
    // Stop propagation of paper-radio-button change event so we can set the value of this element first.
    // Otherwise tangy-form-item will find the wrong value for this element.
    event.stopPropagation()
    if (!this.isReady) return
    // The value we dispatch is the event.target.name. Remember, that's the option that was just selected
    // and the option's name selected is the value of this element.
    this.dispatchEvent(new CustomEvent('INPUT_VALUE_CHANGE', {
      detail: {
        inputName: this.name,
        inputValue: event.target.name,
        inputInvalid: false,
        inputIncomplete: false
      },
      bubbles: true
    }))
  }

  onValueChange(value) {
    if (!this.isReady) return
    this.$['paper-radio-group'].selected = value
  }

  onDisabledChange(value) {
    let paperRadioButtons = this.shadowRoot.querySelectorAll('paper-radio-button')
    if (value == true) paperRadioButtons.forEach((button) => button.setAttribute('disabled', true))
    if (value == false) paperRadioButtons.forEach((button) => button.removeAttribute('disabled'))
  }
  onHiddenChange(value) {
  }

}
window.customElements.define(TangyAcasi.is, TangyAcasi)
