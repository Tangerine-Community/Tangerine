import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LitElement, html } from 'lit-element';
import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';
import { t } from 'tangy-form/util/t.js'

export class FindParticipantByCase extends LitElement  {

  constructor() {
    super()
    this.value = {
      caseId: '',
      participantId: ''
    }
  }

  static get properties() {
    return { 
      name: { type: String },
      value: { type: Object }
    }
  }

  async connectedCallback() {
    super.connectedCallback()
  }

  render() {
    return html`
      <style>
        #container {
          margin: 40px 0px;
        }
        .reset-button paper-button {
          background: var(--accent-color);
          color: var(--accent-text-color);
          margin: 15px 0px;
        }
      </style>
      <div id="container">
        ${!this.value.caseId && !this.value.participantId ? html`
          <find-case @case-selected="${(event) => this.onCaseSelected(event)}"></find-case>
        `:``}
        ${this.value.caseId && !this.value.participantId ? html`
          ${t(`Now which participant.`)}
          <select-participant caseId="${this.value.caseId}" @participant-selected="${(event) => this.onParticipantSelected(event)}"></select-participant>
        `:``}
        ${this.value.caseId && this.value.participantId ? html`
          <div class="selected-participant">
            ${t(`Selected Participant`)}: ${this.participantListing}
          </div>
          <div class="reset-button">
            <paper-button @click="${() => this.reset()}">${t(`RESET`)}</paper-button>
          </div>
        `:``}
      </div>
    `
  }

  reset() {
    this.value = {caseId: '', participantId: ''}
  }

  onParticipantSelected(event) {
    this.participantListing = unsafeHTML(event.detail.participant.listItem)
    this.value = {
      caseId: this.value.caseId,
      participantId: event.target.value
    }
    this.dispatchEvent(new CustomEvent('change'))
  }

  onCaseSelected(event) {
    this.value = {
      caseId: event.target.value,
      participantId: ''
    }
    this.dispatchEvent(new CustomEvent('change'))
  }

  validate() {
    if (this.required) {
      return this.value && this.value.caseId && this.value.participantId
        ? true
        : false
    } else {
      return true
    }
  }

}


customElements.define('find-participant-by-case', FindParticipantByCase);
