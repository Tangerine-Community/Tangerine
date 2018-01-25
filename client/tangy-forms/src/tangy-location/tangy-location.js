// import {Element as PolymerElement} from "@polymer/polymer/polymer-element";
import {Element} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../../node_modules/@polymer/paper-input/paper-input.js'

import '../tangy-form/tangy-element-styles.js';
// import '../../../underscore/underscore.js';
import {Loc} from './loc.js';
/**
 * `tangy-location`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class TangyLocation extends Element {
  static get template() {
    return `
      <style include="tangy-element-styles"></style>
      <div id="container"></div>
      <slot></slot>
`;
  }

  static get is() { return 'tangy-location'; }
  static get properties() {
    return {
      name: {
        type: String,
        value: 'location'
      },
      value: {
        type: Array,
        value: [],
        // reflectToAttribute: true,
        observer: 'render'
      },
      label: {
        type: String,
        value: 'Location'
      },
      required: {
        type: Boolean,
        value: false
      },
      invalid: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      locationSrc: {
        type: String,
        value: '../location-list.json'
      },
      showLevels: {
        type: String,
        value: ''
      },
      hidden: {
        type: Boolean,
        value: false
      },
      disabled: {
        type: Boolean,
        value: false,
        observer: 'render'
      }
    };
  }

  async connectedCallback() {
    // super.connectedCallback();
    Element.prototype.connectedCallback.call(this);
    // When we hear change events, it's coming from users interacting with select lists.
    this.shadowRoot.addEventListener('change', this.onSelectionChange.bind(this))
  }

  render() {

    // Get levels configured on this.showLevels.
    let levels = this.showLevels.split(',')

    // Get selections from this.value but scaffold out selections if there is no value.
    let selections = [...this.value]
    if (selections.length === 0) {
      levels.forEach(level => {
        selections = [...selections, ...[{level, value: ''}]]
      })
    }

    // Calculate the options for each select. Returns an object keyed by select level.
    let options = this.calculateLevelOptions(selections)

    // Render template and assign to the container.
    this.$.container.innerHTML = `

      <label>
        ${this.label}
      </label>

      ${selections.map((selection, i) => `

        
        <div class="mdc-select">
            <select class="mdc-select__surface"
          name=${selection.level}
          ${(options[selection.level].length === 0) ? 'hidden' : ''}
          ${(this.disabled) ? 'disabled' : ''}
        > 
          <option value="" default selected ${(options[selection.level].length === 0) ? 'hidden' : ''} disabled='disabled'>Pick a ${selection.level} </option>
          

          ${options[selection.level].map((option, i) => `
            <option 
              value="${option.id}" 
              ${(selection.value === option.id) ? 'selected' : ''}
             >
              ${option.label}
            </option>
          `)}

        </select>
        <div class="mdc-select__bottom-line"></div>
        
        </div>
        <br />
        <br />
      `).join('')}
    `

  }

  calculateLevelOptions(selections) {

    // Options is an object where the keys are the level and the value is an array of location objects that are options given previously selected.
    let options = {}
    // Queries contain the Loc.query() parameters required to find options for a given level. Level is the key which points to an object where the properties
    // are the parameters for the Loc.query().
    let queries = {}
    // firstLevelNotSelected is the first level with no selection and the last level we will bother calculating options for.
    let firstLevelNotSelected = ''
    // Levels for querying.
    let levels = this.showLevels.split(',')

    // Find the first level not selected.
    let firstSelectionNotSelected = (selections.find(selection => (selection.value === '')))
    firstLevelNotSelected = (firstSelectionNotSelected) ? firstSelectionNotSelected.level : ''

    // Generate queries.
    selections.forEach((selection, i) => {
      // Only generate queries for levels that are selected or the first level not selected.
      if (selection.value === '' && selection.level !== firstLevelNotSelected) return
      // Slice out the selections at this level from all selections.
      let selectionsAtThisLevel = selections.slice(0, i)
      // Transform the array of objects to an array of levels.
      let queryLevels = selectionsAtThisLevel.map(s => s.level)
      // Transform selectionsAtThisLevel Array to queryCriteria Object.
      let queryCriteria = {}
      selectionsAtThisLevel.forEach(selection =>  queryCriteria[selection.level] = selection.value)
      // Set the query.
      queries[selection.level] = {
        levels: queryLevels,
        criteria: queryCriteria
      }
    })

    // Run queries to get options.
    selections.forEach(selection => {
      if (queries[selection.level]) {
        let query = queries[selection.level]
        Loc.query(levels, query.criteria, (res) => {
          options[selection.level] = res
        })
      } else {
        options[selection.level] = []
      }
    })

    return options
  }

  // On selection change event, calculate our new value and dispatch an event.
  onSelectionChange(event) {

    let levels = this.showLevels.split(',')

    // Get selections from this.value but scaffold out selections if there is no value.
    let selections = [...this.value]
    if (selections.length === 0) {
      levels.forEach(level => {
        selections = [...selections, ...[{level, value: ''}]]
      })
    }

    // Calculate our new value.
    let newSelections =  selections.map(selection => {
      // Modify the selection level associated with the event.
      if (selection.level === event.target.name) {
        return {
          level: event.target.name,
          value: event.target.value
        }
      }
      // Make sure to set the selection values to '' for all selections after the one just selected.
      else if (levels.indexOf(selection.level) > levels.indexOf(event.target.name)) {
        return {
          level: selection.level,
          value: ''
        }
      }
      // Return unmodified selections if they are unrelated to this event.
      else {
        return selection
      }
    })

    // Check if incomplete.
    let inputIncomplete = false
    if (newSelections.find(selection => selection.value === '')) inputIncomplete = true

    // Dispatch the event only if selections at all levels are made.
    let detail = {
      inputName: this.name,
      inputValue: newSelections,
      inputInvalid: false,
      inputIncomplete
    }
    this.dispatchEvent(new CustomEvent('INPUT_VALUE_CHANGE', {
      detail,
      bubbles: true
    }))

  }
}

window.customElements.define(TangyLocation.is, TangyLocation);
