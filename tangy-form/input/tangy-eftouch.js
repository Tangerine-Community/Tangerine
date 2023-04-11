import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../util/html-element-props.js'
import './tangy-radio-buttons.js'
import '../style/tangy-common-styles.js'
import { TangyInputBase } from '../tangy-input-base.js'

/**
 * `tangy-acasi`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class TangyEftouch extends TangyInputBase {

  static get is() {
    return 'tangy-eftouch'
  }

  static get properties() {
    return {
      fromTopOfScreen: {
        type: Number,
        value: 115,
        reflectToAttribute: true,
        observer: 'render'
      },
      height: {
        type: Number,
        value: 400,
        reflectToAttribute: true,
        observer: 'render'
      },
      hintText: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      errorMessage: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      width: {
        type: Number,
        reflectToAttribute: true,
        observer: 'render'
      },
      goNextOnTimeLimit: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      correct: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      incorrect: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      transitionMessage: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      transitionSound: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      openSound: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      transitionDelay: {
        type: Number,
        value: 0,
        reflectToAttribute: true
      },
      inputSound: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      timeLimit: {
        type: Number,
        value: 0,
        reflectToAttribute: true
      },
      warningTime: {
        type: Number,
        value: 0,
        reflectToAttribute: true
      },
      warningMessage: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      name: {
        type: String,
        value: ''
      },
      onChange: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      value: {
        type: Object,
        value: {startTime: 0, selectionTime: 0, selection: []},
        reflectToAttribute: true,
        observer: 'render'
      },
      required: {
        type: Boolean,
        value: false
      },
      disabled: {
        type: Boolean,
        value: false,
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
        reflectToAttribute: true
      },
      skipped: {
        type: Boolean,
        value: false,
        observer: 'onSkippedChange',
        reflectToAttribute: true
      },
      invalid: {
        type: Boolean,
        value: false,
        observer: 'render',
        reflectToAttribute: true
      },
      incomplete: {
        type: Boolean,
        value: true,
        reflectToAttribute: true
      },
      inputSoundTriggered: {
        type: Boolean,
        value: false
      },
      openSoundTriggered: {
        type: Boolean,
        value: false
      },
      transitionSoundTriggered: {
        type: Boolean,
        value: false
      },
      identifier: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      }
    };
  }

  static get template () {
    return html``
  }

  connectedCallback () {
    super.connectedCallback()
    if (this.openSound) {
      try {
        new Audio(this.openSound).play()
      } catch (e) {
        // It's ok. Probaly just tests running.
      }
      this.openSoundTriggered = true
    }
    if (!this.width) {
      this.width = document.documentElement.offsetWidth
    }
    this.style.width = `${this.width}px`
    this.style.height = `${this.height}px`
    this.render()
    if (this.value.startTime === 0) {
      this.value.startTime = new Date().getTime()
    }
    if (this.warningMessage) {
      this.warningTimeout = setTimeout(() => {
        this.setAttribute('warning-triggered', true)
      }, this.warningTime)
    }
    if (this.timeLimit) {
      this.timeLimitTimeout = setTimeout(() => {
        this.disabled = true
        if (this.hasAttribute('go-next-on-time-limit')) this.transition(true)
      }, this.timeLimit)
    }
    this.fitItInterval = setInterval(this.fitIt.bind(this), Math.floor(1000/30))
    this.fitIt()
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    if (this.fitItInterval) clearInterval(this.fitItInterval)
    if (this.warningTimeout) clearTimeout(this.warningTimeout)
    if (this.timeLimitTimeout) clearTimeout(this.timeLimitTimeout)
    // fire transition snd if configured *and* if it has not already been fired when we get here.
    // it may have fired due to auto-progress
    // see if a flag has been set when the xistion snd was fired (didTransitionSound fire...)
    if (this.transitionSound && !this.transitionSoundTriggered) {
      try {
        new Audio(this.transitionSound).play()
      } catch (e) {
        // It's ok, probably just tests running.
      }
      this.transitionSoundTriggered = true
      this.dispatchEvent(new CustomEvent('manual-next'))
    }
  }

  render(value) {
    const options = [...this.querySelectorAll('option')]
    if (!this.shadowRoot) return
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          width: 100%
        }
        :host tangy-radio-buttons {
          opacity: 0;
        }
        :host([fullscreen-size-complete]) tangy-radio-buttons {
          opacity: 1 !important;
        }

        tangy-radio-buttons {
          margin: 0 auto;
        }
        #transition {
          padding: 0px;
        }
        :host(:not([transition-triggered])) #transition {
          opacity: 0;
        }
        :host([transition-triggered]) #transition {
          opacity: 1;
          transition: opacity .5s ease-in-out;
          -webkit-transition: opacity .5s ease-in-out;
          -moz-transition: opacity .5s ease-in-out;
          -ms-transition: opacity .5s ease-in-out;
          -o-transition: opacity .5s ease-in-out;
        }
        #warning {
          padding: 0px;
        }
        :host(:not([warning-triggered])) #warning {
          opacity: 0;
        }
        :host([warning-triggered]) #warning {
          opacity: 1;
          transition: opacity .5s ease-in-out;
          -webkit-transition: opacity .5s ease-in-out;
          -moz-transition: opacity .5s ease-in-out;
          -ms-transition: opacity .5s ease-in-out;
          -o-transition: opacity .5s ease-in-out;
        }
        #messages-box {
          height: 60px;
        }
        #cell img {
          border: #FFF solid 5px;
        }
        #cell[selected] img {
          border: green solid 5px;
        }
        #cell {
          padding: 5px;
          text-align: center;
        }
        :host([highlight-correct]) #cell[correct] img {
          border: yellow solid 5px;
        }

      </style>
      <div id="messages-box">
        ${this.transitionMessage ? `
          <div id="transition">
            ${this.transitionMessage}
          </div>
        ` : ''}
        ${this.warningMessage ? `
          <div id="warning">
            ${this.warningMessage}
          </div>
        ` : ''}
        ${this.incorrect && this.hasAttribute('incorrect-message') ? `
          <div id="incorrect">
            ${this.getAttribute('incorrect-message')}
          </div>
        ` : ''}
        ${this.correct && this.hasAttribute('correct-message') ? `
          <div id="correct">
            ${this.getAttribute('correct-message')}
          </div>
        ` : ''}
        ${this.invalid && this.hasAttribute('error-message') ? `
          <div id="error-message">
            ${this.getAttribute('error-message')}
          </div>
        ` : ''}
      </div>
      <div id="options-box" style="opacity: 0; display: flex; flex-wrap: wrap;">
      ${options.map(option => `
        <span 
          id="cell"
          ef-width="${option.getAttribute('width')}"
          ef-height="${option.getAttribute('height')}"
          ${option.hasAttribute('correct') ? 'correct' : ''}
          ${!option.hasAttribute('disabled') && this.value.selection.includes(option.value) ? `selected` : ``}
          style="
            display: block;
            width:${Math.floor((option.getAttribute('width')/100)*this.width)}px;
            height:${Math.floor((option.getAttribute('height')/100)*(this.height-60))}px;
          ">
          <img 
            ${option.hasAttribute('disabled') ? `disabled` : ''}
            value="${option.value}" 
            ${!option.hasAttribute('src') || option.getAttribute('src') === '' ? `
              disabled
              style="
                height: 100%;
                width: 100%;
              " 
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="
            ` : `
              style="
                max-height: 100%;
                max-width: 100%;
              "
              src="${option.getAttribute('src')}"
            `}
          >
        </span>
      `).join('')}
      </div>
    `
    this.shadowRoot.querySelectorAll('img:not([disabled])').forEach(el => el.addEventListener('click', _ => this.onSelection(_.target)))
  }

  onSelection(target) {
    if (
      (
        this.disabled === true || 
        target.hasAttribute('disabled')
      ) ||
      (
        this.hasAttribute('disable-after-selection') && 
        !this.hasAttribute('multi-select') && 
        this.value &&
        this.value.selection.length === 1
      ) ||
      (
        this.hasAttribute('disable-after-selection') && 
        this.hasAttribute('multi-select') && 
        this.value &&
        this.value.selection &&
        this.value.selection.includes(target.getAttribute('value'))
      )
    ) {
      // Do nothing.
      return
    }
    if (this.inputSound) {
      try {
        new Audio(this.inputSound).play()
      } catch (e) {
        // It's ok. Probaly just tests running.
      }
      this.inputSoundTriggered = true
    }
    this.value = Object.assign({}, this.value, {
      selection: this.hasAttribute('multi-select')
        ? this.value.selection.includes(target.getAttribute('value'))
          ? this.value.selection.reduce((reducedSelection, value) => value !== target.getAttribute('value') ? [value, ...reducedSelection] : reducedSelection, [])
          : parseInt(this.getAttribute('multi-select')) !== this.value.selection.length
            ? [...this.value.selection, target.getAttribute('value')]
            : this.value.selection
        : [ target.getAttribute('value') ],
      selectionTime: new Date().getTime()
    })

    if (this.querySelectorAll('[correct]').length > 0) {
      const correctSelections = [...this.querySelectorAll('[correct]')].map(optionEl => optionEl.getAttribute('value'))
      this.value = {
        ...this.value, 
        ...{
          correct: this.hasAttribute('multi-select') 
            ? correctSelections
              .reduce((allCorrectSelectionsMade, value) => {
                return allCorrectSelectionsMade === false ? false : this.value.selection.includes(value)
              }, true) 
            : correctSelections.includes(this.value.selection[0])
        }
      }     
      if (this.value.correct) {
        this.correct = true
        this.incorrect = false
      } else {
        this.correct = false
        this.incorrect = true
      }
    }
    if (this.hasAttribute('if-incorrect-then-highlight-correct') && this.incorrect === true) {
      this.setAttribute('highlight-correct', '')
    } else if (this.hasAttribute('if-incorrect-then-highlight-correct') && this.correct === true) {
      this.removeAttribute('highlight-correct')
    }
    this.render()
    this.dispatchEvent(new Event('change'))
    if (this.hasAttribute('go-next-on-selection') && this.validate()) {
      if (this.hasAttribute('multi-select') && parseInt(this.getAttribute('multi-select')) === this.value.selection.length) {
        this.transition(true)
      } else if (!this.hasAttribute('multi-select')) {
        this.transition(true)
      }
    }
  }

  transition(goNext = false) {
    if (this.hasAttribute('transition-triggered')) return
    this.setAttribute('transition-triggered', true)
    const finishTransition = () => {
      if (this.transitionSound) {
        try {
          new Audio(this.transitionSound).play()
        } catch (e) {
          // It's ok. Probaly just tests running.
        }
        this.transitionSoundTriggered = true
      }
      if (goNext) this.dispatchEvent(new CustomEvent('next'))
    }
   if (this.transitionDelay > 0) {
      setTimeout(() => {
        finishTransition()
      }, this.transitionDelay)
    } else {
      finishTransition()
    }
  }

  fitIt() {
    const optionsBoxEl = this.shadowRoot.querySelector('#options-box')
    const messageBoxHeight = 60
    const totalHeight = window.innerHeight - optionsBoxEl.offsetTop - messageBoxHeight
    const cellBorder = 10
    const totalWidth = optionsBoxEl.clientWidth
    if (totalWidth > 0) optionsBoxEl.style.opacity = '1'
    // Because browsers don't render so good. Need extra room so it doesn't throw in an eager line break.
    const extraSideRoom = 10
    optionsBoxEl.querySelectorAll('#cell').forEach(cellEl => {
      cellEl.setAttribute('style', `
        display: inline-block;
        width:${Math.floor((cellEl.getAttribute('ef-width')/100)*totalWidth) - cellBorder - extraSideRoom}px;
        height:${Math.floor((cellEl.getAttribute('ef-height')/100)*(totalHeight)) - cellBorder}px;
      `)
    })
  }

  validate() {
    if (this.hasAttribute('required-correct')) {
      return this.value.correct ? true : false
    } else if (this.hasAttribute('required-all') && this.hasAttribute('multi-select')) {
      return this.value.selection && this.value.selection.length === parseInt(this.getAttribute('multi-select')) ? true: false
    } else if (this.hasAttribute('required')) {
      return this.value.selection && this.value.selection.length > 0 ? true: false
    } else {
      return true
    }
  }

  onSkippedChange(newValue, oldValue) {
    if (newValue === true) {
      this.value = this.constructor.properties.value.value
      this.render()
    }
  }

}
window.customElements.define(TangyEftouch.is, TangyEftouch)
