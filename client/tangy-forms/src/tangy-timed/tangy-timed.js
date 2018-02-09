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
      lastAttempted: {
        type: String,
        value: '',
        observer: 'reflect',
        reflectToAttribute: true
      },
      timeSpent: {
        type: Number,
        value: 0,
        reflectToAttribute: true
      }
    };
  }

  ready() {
    super.ready();
    // @TODO: Need to listen to slot for ready.
    setTimeout(() => {
      this.generateGrid()
      // this.reflectInputsToToggles()
    }, 400)
  }


  reflect() {
      this.$.grid.querySelectorAll('tangy-toggle-button').forEach(button => {
        button.pressed = (this.value.indexOf(button.name) === -1) ? false : true
        button.highlighted = (this.lastAttempted === button.name) ? true : false
      })

      // if (input.value) tangyToggleButton.pressed = true
  }

  generateGrid() {

    // Empty the grid, may be a reset.
    this.$.grid.innerHTML = ''

    // Set our countdown to the desired duration.
    this.timeRemaining = this.duration
    this.timeSpent = 0

    // This column mapping is calibrated for a Nexus 7 in landscape mode.
    let columnsMap = [0, 1, 2.5, 4, 6, 8, 10, 12, 14, 16, 20]
    let columnWidthCalculation = `calc(100% * (1/${columnsMap[this.columns]}) - 10px - 1px)`

    // Create tangy-toggle-button per option.
    this.options = [].slice.call(this.querySelectorAll('option'))

    this.options.forEach((option, i) => {
      // Create the tangy toggle button.
      let tangyToggleButton = document.createElement('tangy-toggle-button')
      tangyToggleButton.setAttribute('name', option.value)
      tangyToggleButton.style.width = columnWidthCalculation
      tangyToggleButton.innerHTML = option.innerHTML 
      tangyToggleButton.disabled = true
      this.$.grid.appendChild(tangyToggleButton)
    })

    let tangyToggleButtons = [].slice.call(this.shadowRoot.querySelectorAll('tangy-toggle-button'))
    tangyToggleButtons.forEach ((button) => button.addEventListener('click', this.onTangyToggleButtonClick.bind(this)))

    this.reflect()
  
  }

  // Note that mode is actually this.value.
  onModeChange(value) {

    let tangyToggleButtons = [].slice.call(this.shadowRoot.querySelectorAll('tangy-toggle-button'))
    let inputElements = [].slice.call(this.querySelectorAll('[name]'))

    // reset pressed.
    let controlElements =  [].slice.call(this.shadowRoot.querySelectorAll('paper-fab'))
    controlElements.forEach(element => element.classList.remove('pressed'))

    switch (value) {
      case TANGY_TIMED_MODE_UNTOUCHED: 
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
        this.timer = setInterval(() => {
          this.timeRemaining--;
          this.timeSpent++;
          if (this.timeRemaining === 0) {
            clearInterval(this.timer)
            tangyTimedModeChange(this.name, TANGY_TIMED_MODE_LAST_ATTEMPTED)
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
      break
      case TANGY_TIMED_MODE_LAST_ATTEMPTED:
        tangyTimedTimeSpent(this.name, this.duration - this.timeRemaining)
        this.statusMessage = 'Tap the item last attempted.'
        this.$.lastAttemptedButton.classList.add('pressed')
        this.$.startButton.disabled = true 
        this.$.stopButton.disabled = true 
        this.$.resetButton.disabled = false 
        this.$.markButton.disabled = false 
        this.$.lastAttemptedButton.disabled = true 
        tangyToggleButtons.forEach((button) => button.highlighted = false)
      break
      case TANGY_TIMED_MODE_DONE:
        this.statusMessage = 'You may proceed.'
        this.$.startButton.disabled = true 
        this.$.stopButton.disabled = true 
        this.$.resetButton.disabled = false 
        this.$.markButton.disabled = false 
        this.$.lastAttemptedButton.disabled = false 
      break

    }
  }

  removeValueEntry(name) {
    let newValue = [...this.value] 
    newValue.splice(newValue.indexOf(name), 1)
    this.dispatchEvent(new CustomEvent('INPUT_VALUE_CHANGE', {bubbles: true, detail: {
      inputName: this.name,
      inputValue: newValue,
      inputIncomplete: true,
      inputInvalid: false
    }}))
  }

  addValueEntry(name) {
    this.dispatchEvent(new CustomEvent('INPUT_VALUE_CHANGE', {bubbles: true, detail: {
      inputName: this.name,
      inputValue: [...this.value, name],
      inputIncomplete: true,
      inputInvalid: false

    }}))
  }

  onTangyToggleButtonClick(event) {

    let tangyToggleButtons = [].slice.call(this.shadowRoot.querySelectorAll('tangy-toggle-button'))
    let inputElements = [].slice.call(this.querySelectorAll('[name]'))
    let value = ''

    switch (this.mode) {
      case TANGY_TIMED_MODE_UNTOUCHED: 
        // Do nothing.
      break
      case TANGY_TIMED_MODE_MARK:
      case TANGY_TIMED_MODE_RUN: 
        event.target.pressed = !event.target.pressed
        if (event.target.pressed) {
          this.addValueEntry(event.target.name)
        } else {
          this.removeValueEntry(event.target.name)
        }
      break
      case TANGY_TIMED_MODE_LAST_ATTEMPTED:
        tangyTimedLastAttempted(this.name, event.target.name)
        // Need to? Can just fire events and take care of it in the reducer.
        // this.reflectTogglesToInputs()
      break
    }
  }

  onStartClick() {
    tangyTimedModeChange(this.name, TANGY_TIMED_MODE_RUN)
  }

  onStopClick() {
    clearInterval(this.timer);
    tangyTimedModeChange(this.name, TANGY_TIMED_MODE_LAST_ATTEMPTED)
  }

  onResetClick() {
    let inputEls = [].slice.call(this.querySelectorAll('[name]'))
    inputEls.forEach(input => this.dispatchInputChange(input.name, ''))
    tangyTimedModeChange(this.name, TANGY_TIMED_MODE_UNTOUCHED)
    this.generateGrid()
    this.dispatchEvent(new CustomEvent('INPUT_VALUE_CHANGE', {bubbles: true, detail: {
      inputName: this.name,
      inputValue: [] 
    }}))
  }

  onMarkClick() {
    tangyTimedModeChange(this.name, TANGY_TIMED_MODE_MARK)
  }

  onLastAttemptedClick(element) {
    tangyTimedModeChange(this.name, TANGY_TIMED_MODE_LAST_ATTEMPTED)
  }
}

window.customElements.define(TangyTimed.is, TangyTimed);
