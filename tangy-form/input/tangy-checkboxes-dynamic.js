import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { t } from '../util/t.js'
import '../util/html-element-props.js'
import './tangy-checkbox.js'
import '../style/tangy-element-styles.js';
import '../style/tangy-common-styles.js'
import { TangyInputBase } from '../tangy-input-base.js'

/**
 * `tangy-checkboxes`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class TangyCheckboxesDynamic extends TangyInputBase {

  static get is() { return 'tangy-checkboxes-dynamic'; }

  constructor() {
    super()
    this.t = {
      'selectOneOrMore': t('Select one or more')
    }
  }

  static get template() {
    return html`
      <style include="tangy-common-styles"></style>
      <style include="tangy-element-styles"></style>
      <style>

        :host {
          @apply --tangy-font-common-base;
        }
        
        tangy-checkbox {
          margin-top: 15px;
          margin-right: 25px;
        }
        span {
          font-size: .75em;
          display: block;
        }
        
        
      </style>
      <div class="container">
      </div>
    `;
  }

  static get properties() {
    return {
      name: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      value: {
        type: Array,
        value: [],
        reflectToAttribute: true
      },
      atLeast: {
        type: Number,
        value: 0,
        reflectToAttribute: true
      },
      required: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      disabled: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      label: {
        type: String,
        value: ''
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
      incomplete: {
        type: Boolean,
        value: true,
        reflectToAttribute: true
      },
      invalid: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      optionsListSource: {
        type: String,
        value: ''
      },
      optionsListProperties: {
        type: String,
        value: ''
      },
      optionsListExcludes: {
        type: String,
        value: ''
      },
      optionsListExcludeBy: {
        type: String,
        value: ''
      },
      identifier: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      }
    }
  }

  get optionsList() {
    return this._optionsList ? this._optionsList : undefined
  }

  set optionsList(optionsList) {
    this._optionsList = optionsList
  }

  connectedCallback() {
    super.connectedCallback()

    let that = this
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        try {
          that.optionsList = []
          let optionsDoc = JSON.parse(this.responseText)
          let propertyNames = that.optionsListProperties.split(",")
          let excludeList = that.optionsListExcludes.split(",")
          let name = propertyNames[0]
          let innerHTML = propertyNames[1]
          for (let item of optionsDoc) {
            let excludeOption = false
            for (let exclude of excludeList) {
              if (item[that.optionsListExcludeBy] === exclude) {
                excludeOption = true
              }
            }
            if (!excludeOption) {
              let option = {
                name: item[name],
                innerHTML: item[innerHTML]
              }
              that.optionsList.push(option)
            }
          }

          that.render()
          that.dispatchEvent(new CustomEvent('checkbox-options-loaded'))
        } catch (e) {
          // Do nothing. Some stages will not have valid JSON returned.
        }
      } else {
        // Do nothing. readyState is returning something else.
      }
    }
    request.open('GET', this.optionsListSource);
    request.send();
  }

  render() {
    let containerEl = this.shadowRoot.querySelector('.container')
    let checkboxesEl = document.createElement('tangy-checkboxes')
    for (let option of this.optionsList) {
      let optionEl = document.createElement('option')
      optionEl.name = option.name
      optionEl.value = option.name
      optionEl.innerHTML = option.innerHTML
      try {
        checkboxesEl.appendChild(optionEl)
      } catch (e) {
        console.log("e: " + e)
      }
    }
    let newValue = []
    checkboxesEl.addEventListener('change', this.onCheckboxesClick.bind(this))
    newValue = checkboxesEl.getProps()
    if (!this.value || (typeof this.value === 'object' && this.value.length < newValue.length)) {
      this.value = newValue
    }
    containerEl.appendChild(checkboxesEl)
  }

  onCheckboxesClick(event) {
    let newValue = []
    let el = this.shadowRoot.querySelector('tangy-checkboxes')
    newValue = el.getProps()
    this.value = newValue.value
    this.dispatchEvent(new CustomEvent('change'))
  }

  onSkippedChange(newValue, oldValue) {
    if (newValue === true) {
      this.value = this.constructor.properties.value.value
      this.render()
    }
  }

}
window.customElements.define(TangyCheckboxesDynamic.is, TangyCheckboxesDynamic);
