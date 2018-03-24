import {Element} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../../node_modules/@polymer/paper-button/paper-button.js';
import '../../node_modules/@polymer/paper-fab/paper-fab.js';
import '../../node_modules/@polymer/iron-icons/iron-icons.js';
import '../../node_modules/@polymer/iron-icons/av-icons.js';
import '../../node_modules/@polymer/iron-icons/editor-icons.js';
import '../../node_modules/@polymer/iron-icon/iron-icon.js';
import '../tangy-toggle-button/tangy-toggle-button.js';
import '../tangy-form/tangy-common-styles.js'
import { tangyTimedModeChange, tangyTimedIncrement, tangyTimedLastAttempted, tangyTimedTimeSpent  } from '../tangy-form/tangy-form-actions.js'
/**
 * `tangy-timed`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */

const TANGY_TIMED_MODE_UNTOUCHED = 'TANGY_TIMED_MODE_UNTOUCHED'
const TANGY_TIMED_MODE_RUN = 'TANGY_TIMED_MODE_RUN'
const TANGY_TIMED_MODE_MARK = 'TANGY_TIMED_MODE_MARK'
const TANGY_TIMED_MODE_LAST_ATTEMPTED = 'TANGY_TIMED_MODE_LAST_ATTEMPTED'
const TANGY_TIMED_MODE_DONE = 'TANGY_TIMED_MODE_DONE'
const TANGY_TIMED_COMPLETE = 'TANGY_TIMED_COMPLETE'
const TANGY_TIMED_MODE_DISABLED = 'TANGY_TIMED_MODE_DISABLED'

class TangyTimed extends Element {
  static get template() {
    return `
    <style include="tangy-common-styles"></style>
    <style>
      :host {
        display: block;
      }
      
      :host #icon {
        display: block;
      }
      tangy-toggle-button { 
        display: inline-block;
        margin:10px 0 0 2%;
        flex-grow: 1;
        height:60px;
      }
      #container {
        width: 100%;
        position: relative;
      }
            
      #grid {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
      }
      #stopWatch paper-fab {
        color: #FFF;
      }
      
      #stopWatch paper-fab.pressed {
        background: var(--primary-color);
      }
      /*
       * @TODO: Fix to the top of the container and scroll down with the window.
       */
      #stopWatch {
        position: fixed;
        right: 107px;
        top: 7px;
        background: white;
        border: solid 1px #c5c5c5;
        border-radius: 10px;
        padding: 5px;
        color: #333;
        text-align: center;
        z-index: 1000000;
        box-shadow: 3px 3px 10px 1px rgba(0, 0, 255, .2);
      }
      
      #timeRemaining {
        font-size: 2em;
        position: relative;
        top: 7px;
      }
      #timeRemaining,
      paper-fab {
        display: inline-block;
      }
      
      #stopWatch {
        padding: 5px 5px 10px 5px;
      }
      
      #timeRemaining,
      #stopWatch paper-fab {
        /*margin: 0px 0px 0px 10px;*/
      }
      
      paper-fab {
        background-color: var(--accent-color) !important;
      }
      
      paper-fab[disabled] {
        background-color: #cccccc !important;
      }
      paper-fab.pressed {
        background-color: var(--primary-color) !important;
      }
      paper-fab.keyboard-focus {
        background-color: #1976d2;
      }
      #info {
        margin-top: 70px;
      }
    </style>

    <div id="container">
      
      <div id="info">
          <div id="statusMessage"> [[statusMessage]] </div>
          <div id="stopWatch">
            <div id="timeRemaining">[[timeRemaining]]⏱</div>
            <paper-fab id="startButton" mini icon="av:play-arrow" on-click="onStartClick"></paper-fab>
            <paper-fab id="stopButton" mini icon="av:stop" on-click="onStopClick"></paper-fab>
            <paper-fab id="resetButton" mini icon="av:replay" on-click="onResetClick"></paper-fab>
            <paper-fab id="markButton" mini icon="editor:mode-edit" on-click="onMarkClick"></paper-fab>
            <paper-fab id="lastAttemptedButton" mini icon="av:playlist-add-check" on-click="onLastAttemptedClick"></paper-fab>
          </div>
      </div>

      

      <div id="grid">
      </div>

    </div>
`;
  }

  static get is() { return 'tangy-timed'; }
  static get properties() {
    return {
      name: {
        type: String,
        value: 'tangy-timed' 
      },
      value: {
        type: Array,
        value: [],
        observer: 'reflect',
        reflectToAttribute: true
      },
      // Use value for mode. 
      mode: {
        state: true,
        value: TANGY_TIMED_MODE_UNTOUCHED,
        type: String,
        observer: 'onModeChange',
        reflectToAttribute: true
      },
      // Config.
      duration: {
        type: Number,
        value: 60,
        reflectToAttribute: true
      },
      // Number of columns to show items, calibrated for a Nexus 7 in landscape mode.
      columns: {
        type: Number,
        value: 4,
        reflectToAttribute: true
      },
                // Will never be invalid. Just incomplete.
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
      required: {
        type: Boolean,
        value: false
      },
      disabled: {
        type: Boolean,
        onserver: 'onDisabledChange',
        value: false
      },
      timeRemaining: {
        type: Number,
        value: 0,
        reflectToAttribute: true
      }
    };
  }

  ready() {
    super.ready();
    setTimeout(() => {
      this.render()
      this.reflect()
    }, 400)
  }


  reflect() {
    this.shadowRoot.querySelectorAll('tangy-toggle-button').forEach(el => {
      let matchingState = this.value.find(state => el.name == state.name)
      el.setProps(matchingState)
    })
  }

  render() {

    // Empty the grid, may be a reset.
    this.$.grid.innerHTML = ''

    // Set our countdown to the desired duration.
    this.timeRemaining = this.duration

    // This column mapping is calibrated for a Nexus 7 in landscape mode.
    let columnsMap = [0, 1, 2.5, 4, 6, 8, 10, 12, 14, 16, 20]
    let columnWidthCalculation = `calc(100% * (1/${columnsMap[this.columns]}) - 10px - 1px)`

    this.querySelectorAll('option').forEach((option, i) => {
      // Create the tangy toggle button.
      let tangyToggleButton = document.createElement('tangy-toggle-button')
      tangyToggleButton.setAttribute('name', option.value)
      tangyToggleButton.style.width = columnWidthCalculation
      tangyToggleButton.innerHTML = option.innerHTML 
      tangyToggleButton.disabled = true
      this.$.grid.appendChild(tangyToggleButton)
    })

    let newValue = []
    this
      .shadowRoot
      .querySelectorAll('tangy-toggle-button')
      .forEach ((button) => {
        button.addEventListener('click', this.onTangyToggleButtonClick.bind(this))
        newValue.push(button.getProps())
      })
    // Grids may change, preserve old values. Ideally we don't need this in the future with 
    // proper revisioning of forms.
    if (this.value.length < newValue.length) {
      this.value.forEach(oldInputState => {
        let index = newValue.findIndex(newInputState => (newInputState.name === oldInputState.name))
        if (index !== -1) newValue[index] = oldInputState
      })
      this.value = newValue
    }


  }

  // Note that mode is actually this.value.
  onModeChange(value) {

    let tangyToggleButtons = [].slice.call(this.shadowRoot.querySelectorAll('tangy-toggle-button'))
    let inputElements = [].slice.call(this.querySelectorAll('[name]'))

    // reset pressed.
    let controlElements =  [].slice.call(this.shadowRoot.querySelectorAll('paper-fab'))
    controlElements.forEach(element => element.classList.remove('pressed'))

    switch (value) {
      case TANGY_TIMED_MODE_DISABLED: 
        this.timeRemaining = 0 
        this.statusMessage = '';
        this.$.startButton.disabled = false 
        this.$.stopButton.disabled = false 
        this.$.resetButton.disabled = false 
        this.$.markButton.disabled = false 
        this.$.lastAttemptedButton.disabled = true 
      case TANGY_TIMED_MODE_UNTOUCHED: 
        this.timeRemaining = this.duration
        this.statusMessage = 'Click the play button to get started.';
        this.$.startButton.disabled = false 
        this.$.stopButton.disabled = true 
        this.$.resetButton.disabled = true 
        this.$.markButton.disabled = true 
        this.$.lastAttemptedButton.disabled = true 
      break;
      case TANGY_TIMED_MODE_RUN: 
        this.statusMessage = 'Tap items to mark them incorrect.';
        this.$.startButton.classList.add('pressed')
        this.$.startButton.disabled = true 
        this.$.stopButton.disabled = false 
        this.$.resetButton.disabled = true 
        this.$.markButton.disabled = true 
        this.$.lastAttemptedButton.disabled = true 
        this.value = this.value.map(buttonState => {
          buttonState.disabled = false
          buttonState.highlighted = false
          return buttonState
        })
        this.timer = setInterval(() => {
          this.timeRemaining--;
          this.timeSpent++;
          if (this.timeRemaining === 0) {
            clearInterval(this.timer)
            this.style.background = 'red'
            this.value = this.value.map((element, i) => Object.assign({}, element, { highlighted: (this.value.length-1 === i) ? true : false}))
            setTimeout(() => this.style.background = 'white', 200)
            setTimeout(() => this.style.background = 'red', 400)
            setTimeout(() => this.style.background = 'white', 600)
            this.mode = TANGY_TIMED_MODE_LAST_ATTEMPTED
          }
        }, 1000);
      break
      case TANGY_TIMED_MODE_MARK:
        this.statusMessage = 'Tap any boxes that were incorrect during the test.'
        this.$.markButton.classList.add('pressed')
        this.$.startButton.disabled = true 
        this.$.stopButton.disabled = true 
        this.$.resetButton.disabled = false 
        this.$.markButton.disabled = true 
        this.$.lastAttemptedButton.disabled = false 
        this.value = this.value.map(button => {
          button.disabled = false
          return button
        })
      break
      case TANGY_TIMED_MODE_LAST_ATTEMPTED:
        this.statusMessage = 'Tap the item last attempted.'
        this.$.lastAttemptedButton.classList.add('pressed')
        this.$.startButton.disabled = true 
        this.$.stopButton.disabled = true 
        this.$.resetButton.disabled = false 
        this.$.markButton.disabled = false 
        this.$.lastAttemptedButton.disabled = true 
        this.value = this.value.map(button => {
          button.disabled = true
          return button
        })
      break
      // @TODO No longer being used.
      case TANGY_TIMED_MODE_DONE:
        this.statusMessage = 'You may proceed.'
        this.$.startButton.disabled = true 
        this.$.stopButton.disabled = true 
        this.$.resetButton.disabled = false 
        this.$.markButton.disabled = false 
        this.$.lastAttemptedButton.disabled = false 
        this.shadowRoot.querySelectorAll('tangy-toggle-button').forEach(button => button.disabled = true)
      break

    }
  }

  updateValue() {
      }

  onTangyToggleButtonClick(event) {

    let tangyToggleButtons = [].slice.call(this.shadowRoot.querySelectorAll('tangy-toggle-button'))
    let inputElements = [].slice.call(this.querySelectorAll('[name]'))
    let newValue = []

    switch (this.mode) {
      case TANGY_TIMED_MODE_UNTOUCHED: 
         
      break
      case TANGY_TIMED_MODE_MARK:
      case TANGY_TIMED_MODE_RUN: 
        // Get the props of the buttons, save to value.
        this.shadowRoot
          .querySelectorAll('tangy-toggle-button')
          .forEach(button => newValue.push(button.getProps()))
        this.value = newValue
        this.dispatchEvent(new Event('change'))
      break
      case TANGY_TIMED_MODE_LAST_ATTEMPTED:
        // Find the last marked and do not set last attempted if what is just clicked is >.
        let lastMarkedIndex = 0
        this.value.forEach((option, i) => lastMarkedIndex = (option.pressed) ? i : lastMarkedIndex)
        // Set the state of the button, assign to value which will trigger reflecting to its element.
        newValue = this.value.map((option, i) => {
          if (option.name === event.target.name && i >= lastMarkedIndex) {
            option.highlighted = true
          } else {
            option.highlighted = false
          }
          return option
        }) 
        this.value = newValue
        this.dispatchEvent(new Event('change'))
      break
    }
  }

  onStartClick() {
    this.reset()
    this.mode = TANGY_TIMED_MODE_RUN
  }

  onStopClick() {
    clearInterval(this.timer);
    this.value = this.value.map((element, i) => Object.assign({}, element, { highlighted: (this.value.length-1 === i) ? true : false}))
    this.mode = TANGY_TIMED_MODE_LAST_ATTEMPTED
  }

  onResetClick() {
    this.reset()
    this.mode = TANGY_TIMED_MODE_UNTOUCHED
      // this.dispatchEvent(new Event('change', {bubbles: true}))
  }

  onMarkClick() {
    this.mode = TANGY_TIMED_MODE_MARK
  }

  onLastAttemptedClick(element) {
    this.mode = TANGY_TIMED_MODE_LAST_ATTEMPTED
  }

  onDisabledChange() {
    if (this.disabled === true) this.mode = TANGY_TIMED_MODE_DISABLED
  }

  reset() {
    this.value = this.value.map(option => {
      option.highlighted = false
      option.value = ''
      option.pressed = false
      option.disabled = true
      return option
    })
  }

  validate() {
    let lastAttempted = this.value.find(state => (state.highlighted) ? state : false) 
    if (this.required && !this.disabled && !this.hidden && lastAttempted) {
      this.invalid = false
      return true
    } else {
      this.invalid = true
      return false
    }
  }


}

window.customElements.define(TangyTimed.is, TangyTimed);
