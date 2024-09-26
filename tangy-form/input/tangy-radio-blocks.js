import { html } from '@polymer/polymer/polymer-element.js';
import { t } from '../util/t.js'
import '../util/html-element-props.js'
import './tangy-radio-block.js'
import '../style/tangy-element-styles.js';
import '../style/tangy-common-styles.js'
import { TangyInputBase } from '../tangy-input-base.js'
import './tangy-radio-block.js'
/**
 * `tangy-radio-blocks`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class TangyRadioBlocks extends TangyInputBase {

  static get is() { return 'tangy-radio-blocks'; }

  constructor() {
    super()
    this.value = []
    this.t = {
      'selectOnlyOne': t('Select only one')
    }
  }

  static get template() {
    return html`
      <style include="tangy-element-styles"></style>
      <style include="tangy-common-styles"></style>

      <style>
        #container {
          height: var(--container-height, 50vh);
          background-color: var(--container-background-color, #fff);
          border-radius: 1rem;
          padding: 4rem 1.2rem;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }
        #blockContainer.columns {
          flex-direction: column;
          justify-content: normal;
        }
        .columns tangy-radio-block {
          --width: 100%;
          --height: 4rem;
          --justify-content: left;
          width: 100%;
          margin: .2rem 0;
          padding: 0px;
        }
        #blockContainer {
          height: 100%;
          display: flex;
          justify-content: space-around;
          font-size: 4rem;
          font-weight: 700;
          text-align: center;
          flex-grow: 1;
          align-items: center;
          position: relative;
        }
      
        #hint-text {
          color: gray;
          font-size: 1em;
          font-weight: lighter;
        }
      </style>
      
      <div class="flex-container">
        <div id="qnum-number"></div>
        <div id="qnum-content">
          <label id="label" for="group"></label>
          <label class="hint-text"></label>
          <div id="blockContainer"></div>
          <label id="error-text"></label>
          <div id="warn-text"></div>
          <div id="discrepancy-text"></div>
        </div>
      </div>
    `;
  }

  static get properties() {
    return {
      orientation: {
        type: String,
        // columns or rows.
        value: 'columns',
        reflectToAttribute: true
      },
      hideButtons: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      hideHelpText: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      name: {
        type: String,
        value: '',
        observer: 'reflect',
        reflectToAttribute: true
      },
      value: {
        type: Array,
        value: [],
        observer: 'reflect',
        reflectToAttribute: true
      },
      hintText: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      required: {
        type: Boolean,
        value: false,
        observer: 'reflect',
        reflectToAttribute: true
      },
      label: {
        type: String,
        value: '',
        observer: 'reflect',
        reflectToAttribute: true
      },
      disabled: {
        type: Boolean,
        value: false,
        observer: 'reflect',
        reflectToAttribute: true
      },
      hasWarning: {
        type: Boolean,
        value: false,
        observer: 'onWarnChange',
        reflectToAttribute: true
      },
      hasDiscrepancy: {
        type: Boolean,
        value: false,
        observer: 'onDiscrepancyChange',
        reflectToAttribute: true
      },
      hidden: {
        type: Boolean,
        value: false,
        observer: 'reflect',
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
        observer: 'onInvalidChange',
        reflectToAttribute: true
      },
      incomplete: {
        type: Boolean,
        value: true,
        observer: 'reflect',
        reflectToAttribute: true
      },
      columns: {
        type: Number,
        value: 0,
        reflectToAttribute: true
      },
      noMargin: {
        type: Boolean,
        value: false,
        observer: 'reflect',
        reflectToAttribute: true
      },
      questionNumber: {
        type: String,
        value: '',
        observer: 'reflect',
        reflectToAttribute: true
      },
      warnText: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      discrepancyText: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      identifier: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      }
    }
  }

  ready() {
    super.ready()
    this.render()
    this.reflect()
    this.shadowRoot.querySelector('.hint-text').innerHTML = this.hasAttribute('hint-text')
        ? this.getAttribute('hint-text')
        : ''
    this.shadowRoot.querySelector('#label').innerHTML = this.hasAttribute('label')
        ? this.getAttribute('label')
        : ''
    if (this.orientation === 'rows') {
      this.shadowRoot.querySelector('#blockContainer').setAttribute('class', 'columns')
    }
  }

  reflect() {
    this.shadowRoot.querySelectorAll('tangy-radio-block').forEach(el => {
      let matchingState = this.value.find(state => el.name == state.name)
      el.setProps(matchingState)
      el.disabled = this.disabled
      el.hidden = this.hidden
    })
  }

  render() {
    this.$['qnum-number'].innerHTML = `<label>${this.questionNumber}</label>`;
    this.$.blockContainer.innerHTML = ''
    // Populate options as tangy-radio-block elements
    let options = this.querySelectorAll('option')
    let i = 0
    let table = document.createElement('table')
    let tr = document.createElement('tr')
    for (let option of options) {
      let button = document.createElement('tangy-radio-block')
      if (option.hasAttribute('hint-text')) {
        button.setAttribute('hint-text', option.getAttribute('hint-text'))
      }
      if (option.hasAttribute('image')) {
        button.setAttribute('image', option.getAttribute('image'))
      }
      if (option.hasAttribute('sound')) {
        button.setAttribute('sound', option.getAttribute('sound'))
      }
      if (option.hasAttribute('play-on-open')) {
        button.setAttribute('play-on-open', option.getAttribute('play-on-open'))
      }
      if (option.hasAttribute('prompt-for')) {
        button.setAttribute('prompt-for', option.getAttribute('prompt-for'))
      }
      button.hideButton = (this.hideButtons || option.hasAttribute('hidden')) ? true : false
      button.name = option.value
      button.innerHTML = option.innerHTML      
      if (this.columns > 0) {
        let td = document.createElement('td')
        td.style.width = `${Math.floor(100*(1/this.columns))}%`
        td.appendChild(button)
        if ((i+1)%this.columns === 0) {
          tr.appendChild(td)
          table.appendChild(tr)
          tr = document.createElement('tr')
        } else {
          tr.appendChild(td)
        }
        if (i+1 === options.length) this.$.blockContainer.appendChild(table)
        i++
      } else {
        this.$.blockContainer.appendChild(button)
      }
    }
    let newValue = []
    this
      .shadowRoot
      .querySelectorAll('tangy-radio-block')
      .forEach((el) => {
        el.addEventListener('change', this.onRadioButtonChange.bind(this))
        newValue.push(el.getProps())
      })
    if (!this.value || (typeof this.value === 'object' && this.value.length < newValue.length)) {
      this.value = newValue
    }

  }

  onInvalidChange(value) {
    this.shadowRoot.querySelector('#error-text').innerHTML = this.invalid
      ? `<iron-icon icon="error"></iron-icon> <div> ${ this.hasAttribute('error-text') ? this.getAttribute('error-text') : ''} </div>`
      : ''
  }

  onRadioButtonChange(event) {
    let targetButton = event.target
    if (targetButton.value = 'on') {
      this
        .$
        .blockContainer
        .querySelectorAll('tangy-radio-block')
        .forEach(el => {
          if (el.name !== targetButton.name && targetButton.value == 'on') {
            el.value = ''
          }
        })
    }

    let newValue = []
    this.shadowRoot
      .querySelectorAll('tangy-radio-block')
      .forEach(el => newValue.push(el.getProps()))
    this.value = newValue
    this.dispatchEvent(new CustomEvent('change'))

  }

  validate() {
    let foundOne = false
    this.shadowRoot.querySelectorAll('[name]').forEach(el => {
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
  
  onDiscrepancyChange(value) {
    this.shadowRoot.querySelector('#discrepancy-text').innerHTML = this.hasDiscrepancy
      ? `<iron-icon icon="flag"></iron-icon> <div> ${ this.hasAttribute('discrepancy-text') ? this.getAttribute('discrepancy-text') : ''} </div>`
      : ''
  }

  onWarnChange(value) {
    this.shadowRoot.querySelector('#warn-text').innerHTML = this.hasWarning
      ? `<iron-icon icon="warning"></iron-icon> <div> ${ this.hasAttribute('warn-text') ? this.getAttribute('warn-text') : ''} </div>`
      : ''
  }

  onSkippedChange(newValue, oldValue) {
    if (newValue === true) {
      this.value = this.constructor.properties.value.value
      this.render()
      this.reflect()
    }
  }

}
window.customElements.define(TangyRadioBlocks.is, TangyRadioBlocks);
