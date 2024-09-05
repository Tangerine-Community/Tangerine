import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { t } from '../util/t.js'
import '../util/html-element-props.js'
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/av-icons.js';
import '@polymer/iron-icons/editor-icons.js';
import '@polymer/iron-icon/iron-icon.js';
import './tangy-toggle-button.js';
import '../style/tangy-common-styles.js'
import { TangyInputBase } from '../tangy-input-base.js'

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
const TANGY_TIMED_CAPTURE_ITEM_AT = 'TANGY_TIMED_CAPTURE_ITEM_AT'

class TangyTimed extends TangyInputBase {
  constructor() {
    super()
    this.t = {
      mark: t('MARK'),
      lastAttempted: t('LAST ATTEMPTED'),
      start: t('START'),
      stop: t('STOP'),
      reset: t('RESET')
    }
  }
  static get template() {
    return html`
    <style include="tangy-common-styles"></style>
    <style include="tangy-element-styles"></style>
    <style>
      :host {
        display: block;
        font-size: 1.5em;
      }
      
      :host #icon {
        display: block;
      }
      tangy-toggle-button { 
        display: block;
        width: 90%;
        height:60px;
        --tangy-toggle-button-font-size:5em;
      }
      table{
        width: 100%;
        border-collapse:collapse;
      }
      tr {
        width: 100%;
      }
      
      td{
          text-align: left;
          border: none;
      } 
      td.row-marker {
          padding: 0 0 0 15px;
          width: 50px;
          text-align: left;
          border: none;
      }
      #container {
        overflow: scroll;
        width: 100%;
        position: relative;
      }
            
      #grid {
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
        position: absolute;
        right: 50px;
        top: 0px;
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
        padding-top: 70px;
      }

      .blink-green-bg{
          animation-name: animation;
          animation-duration: 0.2s;
          animation-timing-function: steps(5);
          animation-iteration-count: 3;    
          animation-play-state: running;
      }
      @keyframes animation {
        0.0%     {background-color:var(--document-background-color);}
        50.0%  {background-color:green;}
        100.0%  {background-color:var(--document-background-color);}
    }
      
    </style>
    <label class="hint-text">[[hintText]]</label>
    <div id="container">
      
      <div id="info">
          <div id="statusMessage"> [[statusMessage]] </div>
          <div id="bar">
            <div id="touchPalette">
              <paper-button id="markButton" mini on-click="onMarkClick">
                <iron-icon icon="editor:mode-edit"></iron-icon> 
                <template is="dom-if" if="{{showLabels}}">
                  [[t.mark]] 
                </template>
              </paper-button>
              <paper-button id="lastAttemptedButton" mini on-click="onLastAttemptedClick">
                <iron-icon icon="av:playlist-add-check"></iron-icon> 
                <template is="dom-if" if="{{showLabels}}">
                  [[t.lastAttempted]]
                </template>
              </paper-button>
            </div>
            <div id="stopWatch">
              <div id="timeRemaining">⏱ [[timeRemaining]]</div>
              <paper-button id="startButton" on-click="onStartClick">
                <iron-icon icon="av:play-arrow"></iron-icon>
                <template is="dom-if" if="{{showLabels}}">
                  [[t.start]]
                </template>
              </paper-button>
              <paper-button id="stopButton" on-click="onStopClick">
                <iron-icon icon="av:stop"></iron-icon>
                <template is="dom-if" if="{{showLabels}}">
                  [[t.stop]]
                </template>
              </paper-button>
              <paper-button id="resetButton" on-click="onResetClick">
                <iron-icon icon="av:replay"></iron-icon>
                <template is="dom-if" if="{{showLabels}}">
                  [[t.reset]]
                </template>
              </paper-button>
            </div>
          </div>
      </div>

      

      <table id="grid">
      </table>

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
      hidden: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      skipped: {
        type: Boolean,
        value: false,
        observer: 'onSkippedChange',
        reflectToAttribute: true
      },
      autoStop: {
        type: Number,
        value: undefined,
        reflectToAttribute: true
      },
      gridVarItemAtTime: {
        type: Number,
        reflectToAttribute: true,
      },
      gridVarTimeIntermediateCaptured: {
        type: Number,
        reflectToAttribute: true,
      },
      gridAutoStopped: {
        type: Boolean,
        value: undefined,
        reflectToAttribute: true
      },
      hintText: {
        type: String,
        value: '',
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
      captureItemAt: {
        type: Number,
        value: undefined,
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
      rowMarkers: {
        type: Boolean,
        value: false
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
      },
      scoreTarget: {
        type: Number,
        value: 0,
        reflectToAttribute: true
      },
      scoreBaseline: {
        type: Number,
        value: 0,
        reflectToAttribute: true
      },
      scoreSpread: {
        type: Number,
        value: 0,
        reflectToAttribute: true
      },
      optionFontSize: {
        type: Number,
        value: 0.7,
        reflectToAttribute: true
      },
      identifier: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      }
    };
  }

  ready() {
    super.ready();
    const styleEl = document.createElement("style")
    styleEl.innerHTML = `tangy-toggle-button { 
        --tangy-toggle-button-font-size:${this.optionFontSize}em;
      }`
    this.shadowRoot.appendChild(styleEl)
    setTimeout(() => {
      this.render()
      this.reflect()
    }, 400)
    setInterval(_ => {
      if (this.getBoundingClientRect().y < 0 && this.getBoundingClientRect().y + this.getBoundingClientRect().height > 0) {
        this.shadowRoot.querySelector('#bar').style.position = 'fixed'
      } else {
        this.shadowRoot.querySelector('#bar').style.position = 'absolute'
      }
      if (this.offsetWidth > 645) {
        this.shadowRoot.querySelector('#info').style.paddingTop = '70px'
      } else {
        this.shadowRoot.querySelector('#info').style.paddingTop = '150px'
      }
    }, 1000)
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

    const rows = [document.createElement('tr')]
    let currentRow = 0
    let currentColumn = 1
    this.querySelectorAll('option').forEach((option, i) => {
      // Create the tangy toggle button.
      let column = document.createElement('td')
      column.style.width = `${Math.floor(100/this.columns)}%` 
      let tangyToggleButton = document.createElement('tangy-toggle-button')
      tangyToggleButton.setAttribute('name', option.value)
      //tangyToggleButton.style.width = `100%` 
      tangyToggleButton.innerHTML = option.innerHTML
      tangyToggleButton.disabled = true
      if (this.disabled) tangyToggleButton.disabled = true
      column.appendChild(tangyToggleButton)
      if ( currentColumn !== 0 && currentColumn % this.columns === 0) {
        rows.push(document.createElement('tr'))
        rows[currentRow].appendChild(column)
        if (this.rowMarkers) {
          const rowMarkerEl = document.createElement('td')
          rowMarkerEl.setAttribute('class', 'row-marker')
          rowMarkerEl.rowNumber = currentRow
          rowMarkerEl.addEventListener('click', (event) => {
            this.rowMarkerClicked(event.target.parentElement.rowNumber)
          })
          rowMarkerEl.innerHTML = `<iron-icon icon="done-all"></iron-icon>`
          rows[currentRow].appendChild(rowMarkerEl)
        }
        currentColumn = 1
        currentRow++
      } else {
        rows[currentRow].appendChild(column)
        currentColumn++
      }
    })
    for (let row of rows) {
      this.$.grid.appendChild(row)
    }

    let newValue = []
    this
      .shadowRoot
      .querySelectorAll('tangy-toggle-button')
      .forEach((button) => {
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
    let controlElements = [].slice.call(this.shadowRoot.querySelectorAll('paper-button'))
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
        this.statusMessage = t('Tap items to mark them incorrect.')
        this.$.startButton.classList.add('pressed')
        this.$.startButton.hidden = true
        this.$.stopButton.hidden = false
        this.$.resetButton.hidden = true
        this.$.markButton.classList.add("pressed")
        this.$.markButton.disabled = false
        this.$.lastAttemptedButton.disabled = true

        if (this.isItemCaptured) {
          clearInterval(this.timer)
          this.timer2 = setInterval(() => {
            let timeSpent = Math.floor((Date.now() - this.startTime) / 1000)
            this.timeRemaining = this.duration - timeSpent
            if (this.timeRemaining <= 0) {
              this.stopGrid()
            }
          }, 200);
        } else {
          clearInterval(this.timer2)
          this.value = this.value.map(buttonState => {
            return Object.assign({}, buttonState, {
              highlighted: false,
              disabled: false
            })
          })
          this.startTime = Date.now()
          this.timer = setInterval(() => {
            let timeSpent = Math.floor((Date.now() - this.startTime) / 1000)
            this.timeRemaining = this.duration - timeSpent
            if (this.timeRemaining <= 0) {
              this.stopGrid()
            }
          }, 200);
        }

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


      case TANGY_TIMED_CAPTURE_ITEM_AT:
        this.statusMessage = t(`Tap the item at ${this.captureItemAt} seconds`)
        this.shadowRoot.querySelector('#container').classList.add('blink-green-bg')
        setTimeout(() => {
          this.shadowRoot.querySelector('#container').classList.remove('blink-green-bg')
        }, 4000);
        break

    }
  }
  shouldGridAutoStop() {
    const tangyToggleButtons = [].slice.call(this.shadowRoot.querySelectorAll('tangy-toggle-button'))
    const firstXButtons = tangyToggleButtons.slice(0, this.autoStop)
    let foundAnUnpressedButton = false
    for (let button of firstXButtons) {
      if (!button.pressed) {
        foundAnUnpressedButton = true
      }
    }
    return foundAnUnpressedButton ? false : true
  }
  stopGrid() {

    clearInterval(this.timer)
    clearInterval(this.timer2)
    clearInterval(this.captureItemAtTimer)
    this.isItemCaptured = false
    this.style.background = 'red'
    setTimeout(() => this.style.background = 'white', 200)
    setTimeout(() => this.style.background = 'red', 400)
    setTimeout(() => this.style.background = 'white', 600)
    if(!this.gridAutoStopped){
      setTimeout(() => alert(t('Please tap on last item attempted.')), 800)
    }
    this.mode = TANGY_TIMED_MODE_LAST_ATTEMPTED
  }
  rowMarkerClicked(rowNumber) {
    switch (this.mode) {
      case TANGY_TIMED_MODE_MARK:
      case TANGY_TIMED_MODE_RUN:
      let lastItemOnRow;
      const allItems =  this.shadowRoot.querySelectorAll('tr')[rowNumber].querySelectorAll('tangy-toggle-button');

      allItems.forEach((tangyToggleButtonEl, i) => {
        tangyToggleButtonEl.pressed = !tangyToggleButtonEl.pressed
            tangyToggleButtonEl.value = 'on'? 'off':'on'
            lastItemOnRow=allItems.length===i+1? tangyToggleButtonEl.name:''
          })
        let newValue = []
        this.shadowRoot
          .querySelectorAll('tangy-toggle-button')
          .forEach(button => newValue.push(button.getProps()))
        this.value = newValue
        if (this.autoStop && this.shouldGridAutoStop()) {
          this.stopGrid()
          this.gridAutoStopped = true
          this.onStopClick(null, lastItemOnRow)
        }  
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
      case TANGY_TIMED_CAPTURE_ITEM_AT:

        newValue = this.value.map((buttonState, index) => {
          if (buttonState.name === event.target.name) {
            this.isItemCaptured = true
            this.gridVarItemAtTime = index + 1
            this.gridVarTimeIntermediateCaptured = this.duration - this.timeRemaining
            return {
              ...buttonState, captured: true,
              disabled: false
            }
          }
          else { return { ...buttonState } }
        })
        this.value = newValue
        this.mode = TANGY_TIMED_MODE_RUN
        break
    }
    if (this.autoStop && this.shouldGridAutoStop()) {
      event.target.highlighted = true
      this.gridAutoStopped = true
      this.stopGrid()
      this.onStopClick(null, event.target.name)
    }
  }

  onStartClick() {
    this.reset()
    this.mode = TANGY_TIMED_MODE_RUN
    if (this.captureItemAt) {
      this.captureItemAtTimer = setTimeout(() => {
        this.mode = TANGY_TIMED_CAPTURE_ITEM_AT
      }, this.captureItemAt * 1000);
    }

  }

  onStopClick(event, lastItemAttempted) {
    this.endTime = Date.now()
    clearInterval(this.timer);
    clearInterval(this.timer2);
    clearInterval(this.captureItemAtTimer);
    this.isItemCaptured = false;
    // We have to check for typeof string because the event handler on the stop button puts an integer in the second param for some reason.
    // If it's a string, then we know it's an ID of something which should actually be lastItemAttempted.
    if (typeof lastItemAttempted === 'string') {
      this.value = this.value.map((element, i) => Object.assign({}, element, { highlighted: (lastItemAttempted === element.name) ? true : false }))
    } else {
      this.value = this.value.map((element, i) => Object.assign({}, element, { highlighted: (this.value.length - 1 === i) ? true : false }))
    }
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
    this.gridAutoStopped = false
    this.value = this.value.map(option => {
      option.highlighted = false
      option.captured = false
      option.value = ''
      option.pressed = false
      option.hidden = true
      option.gridVarTimeIntermediateCaptured = null
      option.startTime = 0
      option.endTime = 0
      return option
    })
  }

  validate() {
    let lastAttempted = this.value.find(state => (state.highlighted) ? state : false)
    // If this is required, it's not hidden, and there is no last attempted... Then this is invalid.
    if (this.required && !this.hidden && !lastAttempted) {
      this.invalid = true 
    } else {
      this.invalid = false 
    }
    return !this.invalid 
  }

  onSkippedChange(newValue, oldValue) {
    if (newValue === true) {
      this.value = this.constructor.properties.value.value
    }
  }

}

window.customElements.define(TangyTimed.is, TangyTimed);
