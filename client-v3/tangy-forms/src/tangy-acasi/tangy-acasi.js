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
    // Populate paper-radio-button elements by using image data
    // The radio-button value is taken from the img src value.
    let images = this.querySelectorAll('img')
    for (let image of images) {
      let button = document.createElement('paper-radio-button')
      if (image.alt !== '') {
        button.name = image.alt
      } else {
        let src = image.src
        let srcArray = src.split('/')
        let filename = srcArray[srcArray.length-1]
        let name = filename.replace('.png', '')
        button.name = name
      }
      if (this.disabled) button.setAttribute('disabled', true)
      button.innerHTML = image.outerHTML
      paperRadioGroupEl.appendChild(button)
    }
    paperRadioGroupEl.selected = this.value
    if (this.required) paperRadioGroupEl.required = true
    this.isReady = true
  }

  ready() {
    super.ready();
    const display_sound_url = '../../assets/sounds/pop.mp3'
    const transition_sound_url = '../../assets/sounds/swish.mp3'

    this.transitionSound = new Audio(transition_sound_url);
    this.transitionSound.play();

    this.displaySound = new Audio(display_sound_url);
    this.displaySound.load();

    // @TODO: Need to listen to slot for ready.
    setTimeout(() => this._prepareForm(), 200)
  }

  _prepareForm() {

    // Find all our img elements.
    this.imgElements = Array.prototype.slice.call(this.shadowRoot.querySelectorAll('img'));
    let soundifyImages = (event) => {
      this.imgElements.forEach(element => {
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
    }
    this.imgElements.forEach(element => {
      element.addEventListener('click', soundifyImages);
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
