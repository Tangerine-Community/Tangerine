/* jshint esversion: 6 */

import {Element as PolymerElement} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../tangy-form/tangy-common-styles.js'
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
    <style include="tangy-common-styles"></style>
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
      paper-button.indigo {
        background-color: var(--paper-indigo-500);
        color: white;
        --paper-button-raised-keyboard-focus: {
          background-color: var(--paper-pink-a200) !important;
          color: white !important;
        };
      }
      paper-button.indigo:hover {
        background-color: var(--paper-indigo-400);
      }
    </style>

    <div class="container">
      <label for="group">[[label]]</label>
      <paper-button id="replay" raised class="indigo" on-click="replay">Play</paper-button>
      <div id="container"></div>
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
      introSrc: {
        type: String,
        value: '../content/assets/sounds/1.mp3'
      },
      transitionSrc: {
        type: String,
        value: '../content/assets/sounds/swish.mp3'
      },
      touchSrc: {
        type: String,
        value: '../content/assets/sounds/pop.mp3'
      },
      touchSources: {
        type: Array
      },
      images: {
        type: String,
        value: '../content/assets/images/never.png,../content/assets/images/once.png,../content/assets/images/few.png,../content/assets/images/many.png'
      },
      onChange: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      value: {
        type: Array,
        value: [],
        observer: 'reflect',
        reflectToAttribute: true
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
    this.renderOptions()
    this.reflect()
  }

  reflect() {
    console.log("i am a mirror")
    this.shadowRoot.querySelectorAll('img').forEach(el => {
      let matchingState = this.value.find(state => el.name == state.name)
      el.setAttributes(matchingState)
      el.disabled = this.disabled
      el.hidden = this.hidden
    })
  }

  renderOptions() {
    // let paperRadioGroupEl = this.shadowRoot.querySelector('paper-radio-group')
    // paperRadioGroupEl.addEventListener('change', this.onPaperRadioGroupChange.bind(this), false)

    this.$.container.innerHTML = ''

    // Populate tangy-radio-button elements by using image data
    // The radio-button value is taken from the imageArray src value.
    // Also create the image.
    let images = this.getAttribute('images')
    let imageArray = images.split(",")
    for (let src of imageArray) {
      // let button = document.createElement('paper-radio-button')
      let srcArray = src.split('/')
      let filename = srcArray[srcArray.length-1]
      let name = filename.replace('.png', '')
      // button.name = name
      // button.setAttribute("name", name)
      // if (this.disabled) button.setAttribute('disabled', true)
      let imageEl = document.createElement('img')
      imageEl.name = name
      imageEl.src = src
      imageEl.className = "acasi-image";
      // button.innerHTML = imageEl.outerHTML
      this.$.container.appendChild(imageEl)
      let brEl = document.createElement('br')
      this.$.container.appendChild(brEl)
    }
    // paperRadioGroupEl.selected = this.value
    // if (this.required) paperRadioGroupEl.required = true
    // this.isReady = true

    // detect change events and update the value
    let newValue = []
    // this
    //   .shadowRoot
    //   .querySelectorAll('paper-radio-button')
    //   .forEach ((el) => {
    //     el.addEventListener('change', this.onRadioButtonChange.bind(this))
    //     // newValue.push(el.getProps())
    //     newValue.push(el.getAttributes())
    //   })
    // if (!this.value || (typeof this.value === 'object' && this.value.length < newValue.length)) {
    //   this.value = newValue
    // }

    // Find all our img elements and populate the dataTouchSrc for each image.
    this.imgElements = Array.prototype.slice.call(this.shadowRoot.querySelectorAll('img'));
    for (let i = 0, len = this.imgElements.length; i < len; i++) {
      let ele = this.imgElements[i];
      if (typeof this.touchSources !== 'undefined' && this.touchSources.length > 1) {
        let touchSrc = this.touchSources[i]
        ele.dataTouchSrc = touchSrc
      } else {
        ele.dataTouchSrc = this.touchSrc
      }
      ele.addEventListener('click', this.onImageChange.bind(this))
      newValue.push(ele.getAttributes())
    }
    if (!this.value || (typeof this.value === 'object' && this.value.length < newValue.length)) {
      this.value = newValue
    }
  }

  ready() {
    super.ready();
    const transition_sound_url = '../content/assets/sounds/swish.mp3'

    if (this.getAttribute('introSrc')) {
      this.transitionSound = new Audio(this.getAttribute('introSrc'));
    } else {
      this.transitionSound = new Audio(transition_sound_url);
    }
    this.transitionSound.play();

    if (this.getAttribute('touchsrc')) {
      this.touchSources = this.getAttribute('touchsrc').split(",")
      // preload the sound only if we have one sound
      if (this.touchSources.length == 1) {
        this.touchSound = new Audio(this.touchSrc);
        this.touchSound.load();
      }
    }

      // @TODO: Need to listen to slot for ready.
    setTimeout(() => this._prepareForm(), 200)
  }

  _prepareForm() {

    // let radios = Array.prototype.slice.call(this.shadowRoot.querySelectorAll('paper-radio-button'));
    // radios.forEach(radio => {
    //   radio.$.radioContainer.style= 'display:none'
    // })

    let activateImages = (event) => {
      // Find all our img elements, remove highlight from imgs already touched, and highlight this one
      this.imgElements = Array.prototype.slice.call(this.shadowRoot.querySelectorAll('img'));
      for (let i = 0, len = this.imgElements.length; i < len; i++) {
        let ele = this.imgElements[i];
        let cls = 'eftouch-selected';
        let hasClass = !!ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'))
        if (hasClass) {
          let reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
          ele.className=ele.className.replace(reg,' ');
        }
      }

      const element = event.srcElement;
//            element.setAttribute('style', 'border: 10px solid #af0; border-radius: 10px;'); ;
      let ele = element;
      let cls = 'eftouch-selected';
      let hasClass = !!ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'))
      if (!hasClass) ele.className += " "+cls;

      const inputEl = this.querySelector('#foo');
      if (inputEl !== null) {
        inputEl.value = event.srcElement.id;
      }
      if (this.touchSources.length > 1) {
        let eleTouchSound = new Audio(ele.dataTouchSrc);
        eleTouchSound.load();
        eleTouchSound.play();
      } else {
        // already preloaded
        this.touchSound.play();
      }
    }
    this.imgElements.forEach(element => {
      element.addEventListener('click', activateImages);
  });

  }

  // onPaperRadioGroupChange(event) {
  //   // Stop propagation of paper-radio-button change event so we can set the value of this element first.
  //   // Otherwise tangy-form-item will find the wrong value for this element.
  //   event.stopPropagation()
  //   if (!this.isReady) return
  //   // The value we dispatch is the event.target.name. Remember, that's the option that was just selected
  //   // and the option's name selected is the value of this element.
  //   this.dispatchEvent(new CustomEvent('INPUT_VALUE_CHANGE', {
  //     detail: {
  //       inputName: this.name,
  //       inputValue: event.target.name,
  //       inputInvalid: false,
  //       inputIncomplete: false
  //     },
  //     bubbles: true
  //   }))
  // }

  // onValueChange(value) {
  //   // if (!this.isReady) return
  //   // this.$['paper-radio-group'].selected = value
  // }

  onDisabledChange(value) {
    let paperRadioButtons = this.shadowRoot.querySelectorAll('paper-radio-button')
    if (value == true) paperRadioButtons.forEach((button) => button.setAttribute('disabled', true))
    if (value == false) paperRadioButtons.forEach((button) => button.removeAttribute('disabled'))
  }

  onHiddenChange(value) {
  }

  replay() {
    console.log("replay")
    this.transitionSound.play();
  }

  // onRadioButtonChange(event) {
  //   let targetButton = event.target
  //   if (targetButton.value = 'on') {
  //     this
  //       .$
  //       .container
  //       .querySelectorAll('paper-radio-button')
  //       .forEach(el => {
  //         if (el.name !== targetButton.name && targetButton.value == 'on') {
  //           el.value = ''
  //         }
  //       })
  //   }
  // }

  onImageChange(event) {
    let targetButton = event.target
    let newvalue = []
    if (targetButton.value = 'on') {
      this
        .$
        .container
        .querySelectorAll('img')
        .forEach(el => {
          if (el.name !== targetButton.name && targetButton.value == 'on') {
            el.setAttribute('value', '')
          } else {
            el.setAttribute('value', 'on')
          }
        })
      this.value = this.value.map(input => {
        if (input.name !== targetButton.name && targetButton.value == 'on') {
          input.value = ''
        } else {
          input.value = 'on'
        }
        return input
        })
      this.dispatchEvent(new Event('change'))
    }
  }

  validate() {
    let foundOne = false
    this.shadowRoot.querySelectorAll('paper-radio-button').forEach(el => {
      if (el.value === 'on') foundOne = true
    })
    if (this.required && !this.hidden && !this.disabled && !foundOne) {
      this.invalid = true
      return false
    } else {
      this.invalid = false
      return true
    }
  }

}
window.customElements.define(TangyAcasi.is, TangyAcasi)
