import {Element} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../../node_modules/@polymer/paper-button/paper-button.js';
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
      #stopWatch paper-button {
        color: #FFF;
      }
      
      #stopWatch paper-button.pressed {
        background: var(--primary-color);
      }

      :host([disabled]) #bar {
        display: none;
      }

      #bar {
        position: fixed;
        right: 50px;
        top: 7px;
        z-index: 1000000;
      }
      #stopWatch {
        float: right;
        margin-right: 15px;
        background: white;
        border: solid 1px #c5c5c5;
        border-radius: 10px;
        padding: 5px;
        color: #333;
        text-align: center;
        box-shadow: 3px 3px 10px 1px rgba(0, 0, 255, .2);
      }

      #bar paper-button {
        font-size: .6em;
      }

      #touchPalette {
        float: right;
        background: white;
        border: solid 1px #c5c5c5;
        border-radius: 10px;
        padding: 5px;
        color: #333;
        text-align: center;
        box-shadow: 3px 3px 10px 1px rgba(0, 0, 255, .2);
      }
      
      #timeRemaining {
        font-size: 1em;
        position: relative;
        top: 7px;
      }
      #timeRemaining,
      paper-button {
        display: inline-block;
      }
      
      #stopWatch, #touchPalette {
        padding: 5px 5px 10px 5px;
      }
      
      #timeRemaining,
      #stopWatch paper-button {
        /*margin: 0px 0px 0px 10px;*/
      }
      
      paper-button {
        background-color: var(--accent-color) !important;
      }
      
      paper-button[disabled] {
        background-color: #cccccc !important;
      }

      paper-button.pressed {
        background-color: var(--primary-color) !important;
      }

      paper-button.keyboard-focus {
        background-color: #1976d2;
      }

      #info {
        margin-top: 70px;
      }
    </style>

    <div id="container">
      
      <div id="info">
          <div id="statusMessage"> [[statusMessage]] </div>
          <div id="bar">
            <div id="touchPalette">
              <paper-button id="markButton" mini on-click="onMarkClick">
                <iron-icon icon="editor:mode-edit"></iron-icon> 
                <template is="dom-if" if="{{showLabels}}">
                  [[markLabel]] 
                </template>
              </paper-button>
              <paper-button id="lastAttemptedButton" mini on-click="onLastAttemptedClick">
                <iron-icon icon="av:playlist-add-check"></iron-icon> 
                <template is="dom-if" if="{{showLabels}}">
                  [[lastAttemptedLabel]]
                </template>
              </paper-button>
            </div>
            <div id="stopWatch">
              <div id="timeRemaining">⏱ [[timeRemaining]]</div>
              <paper-button id="startButton" on-click="onStartClick">
                <iron-icon icon="av:play-arrow"></iron-icon>
                <template is="dom-if" if="{{showLabels}}">
                  [[startLabel]]
                </template>
              </paper-button>
              <paper-button id="stopButton" on-click="onStopClick">
                <iron-icon icon="av:stop"></iron-icon>
                <template is="dom-if" if="{{showLabels}}">
                  [[stopLabel]]
                </template>
              </paper-button>
              <paper-button id="resetButton" on-click="onResetClick">
                <iron-icon icon="av:replay"></iron-icon>
                <template is="dom-if" if="{{showLabels}}">
                  [[resetLabel]]
                </template>
              </paper-button>
            </div>
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
      showLabels: {
        type: Boolean,
        value: false,
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
        value: false,
        reflectToAttribute: true
      },
      timeRemaining: {
        type: Number,
        value: undefined,
        reflectToAttribute: true
      },
      startTime: {
        type: Number,
        value: 0,
        reflectToAttribute: true
      },
      endTime: {
        type: Number,
        value: 0,
        reflectToAttribute: true
      }
    };
  }

  ready() {
    super.ready();
    //setTimeout(() => {
      this.render()
      this.reflect()
    //}, 400)
    this.markLabel = t('MARK')
    this.lastAttemptedLabel = t('LAST ATTEMPTED')
    this.startLabel = t('START')
    this.stopLabel = t('STOP')
    this.resetLabel = t('RESET')
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
    this.timeRemaining = (this.timeRemaining === undefined) ? this.duration : this.timeRemaining

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
      if (this.disabled) tangyToggleButton.disabled = true
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
    let controlElements =  [].slice.call(this.shadowRoot.querySelectorAll('paper-button'))
    controlElements.forEach(element => element.classList.remove('pressed'))

    switch (value) {
      case TANGY_TIMED_MODE_DISABLED: 
        this.timeRemaining = 0 
        this.statusMessage = '';
        this.$.startButton.hidden = false 
        this.$.stopButton.hidden = false 
        this.$.resetButton.hidden = false 
        this.$.markButton.hidden = false 
        this.$.lastAttemptedButton.hidden = true 
        this.value = this.value.map(buttonState => {
          return Object.assign({}, buttonState, {
            disabled: true
          })
        })
      case TANGY_TIMED_MODE_UNTOUCHED: 
        this.timeRemaining = this.duration
        this.statusMessage = t('Click the play button to get started.')
        this.$.startButton.hidden = false 
        this.$.stopButton.hidden = true 
        this.$.resetButton.hidden = true 
        this.$.markButton.disabled = true 
        this.$.lastAttemptedButton.disabled = true 
        this.value = this.value.map(buttonState => {
          return Object.assign({}, buttonState, {
            disabled: true
          })
        })
      break;
      case TANGY_TIMED_MODE_RUN: 
        this.startTime = Date.now()
        this.statusMessage = t('Tap items to mark them incorrect.')
        this.$.startButton.classList.add('pressed')
        this.$.startButton.hidden = true 
        this.$.stopButton.hidden = false 
        this.$.resetButton.hidden = true 
        this.$.markButton.classList.add("pressed")
        this.$.markButton.disabled = false 
        this.$.lastAttemptedButton.disabled = true 
        this.value = this.value.map(buttonState => {
          return Object.assign({}, buttonState, {
            highlighted: false,
            disabled: false
          })
        })
        this.timer = setInterval(() => {
          let timeSpent = Math.floor((Date.now() - this.startTime) / 1000)
          this.timeRemaining = this.duration - timeSpent
          if (this.timeRemaining <= 0) {
            clearInterval(this.timer)
            this.style.background = 'red'
            this.value = this.value.map((element, i) => Object.assign({}, element, { highlighted: (this.value.length-1 === i) ? true : false}))
            setTimeout(() => this.style.background = 'white', 200)
            setTimeout(() => this.style.background = 'red', 400)
            setTimeout(() => this.style.background = 'white', 600)
            setTimeout(() => alert(t('Please tap on last item attempted.')), 800)
            this.mode = TANGY_TIMED_MODE_LAST_ATTEMPTED
          }
        }, 200);
      break
      case TANGY_TIMED_MODE_MARK:
        this.statusMessage = t('Tap any boxes that were incorrect during the test.')
        this.$.markButton.classList.add('pressed')
        this.$.startButton.hidden = true 
        this.$.stopButton.hidden = true 
        this.$.resetButton.hidden = false 
        this.$.markButton.disabled = true 
        this.$.lastAttemptedButton.disabled = false 
        this.value = this.value.map(buttonState => {
          return Object.assign({}, buttonState, {
            disabled: false
          })
        })
      break
      case TANGY_TIMED_MODE_LAST_ATTEMPTED:
        this.statusMessage = t('Tap the item last attempted.')
        this.$.lastAttemptedButton.classList.add('pressed')
        this.$.startButton.hidden = true 
        this.$.stopButton.hidden = true 
        this.$.resetButton.hidden = false 
        this.$.markButton.disabled = false 
        this.$.lastAttemptedButton.disabled = true 
        this.value = this.value.map(buttonState => {
          return Object.assign({}, buttonState, {
            disabled: true
          })
        })
      break
      // @TODO No longer being used.
      case TANGY_TIMED_MODE_DONE:
        this.statusMessage = t('You may proceed.')
        this.$.startButton.hidden = true 
        this.$.stopButton.hidden = true 
        this.$.resetButton.hidden = false 
        this.$.markButton.disabled = false 
        this.$.lastAttemptedButton.disabled = false 
        this.value = this.value.map(buttonState => {
          return Object.assign({}, buttonState, {
            disabled: true
          })
        })
      break

    }
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

        // If this selection is past the a last attempted index, prevent it.
        let itemLastAttemptedIndex = this.value.findIndex(item => (item.highlighted) ? true : false)
        let itemLastMarkedIndex = this.value.findIndex(item => (item.name === event.target.name))
        if (itemLastAttemptedIndex != -1 && itemLastAttemptedIndex < itemLastMarkedIndex) {
          event.target.value = ''
          alert(t('You may not mark an item incorrect that is beyond the last item attempted.'))
          return
        } 
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
          } else if (option.name === event.target.name && i < lastMarkedIndex) {
            alert(t('Last attempted cannot be before an item marked.'))
            option.highlighted = false
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
    this.endTime = Date.now()
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
    if (this.mode != TANGY_TIMED_MODE_RUN) this.mode = TANGY_TIMED_MODE_MARK
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
      option.hidden = true
      return option
    })
  }

  validate() {
    let lastAttempted = this.value.find(state => (state.highlighted) ? state : false) 
    if (this.required && !this.hidden && !this.hidden && lastAttempted) {
      this.invalid = false
      return true
    } else {
      this.invalid = true
      return false
    }
  }


}

window.customElements.define(TangyTimed.is, TangyTimed);
