import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LitElement, html, unsafeHtml } from 'lit-element';
import { t } from 'tangy-form/util/t.js'


export class SelectParticipant extends LitElement  {

  constructor() {
    super()
    this.value = ''
    this.participants = []
  }

  static get properties() {
    return { 
      name: { type: String },
      value: { type: String },
      caseId: { type: String },
      participants: { type: Array },
      ready: { type: Boolean }
    }
  }

  async connectedCallback() {
    super.connectedCallback()
    await T.caseDefinition.load()
    const caseInstance = await T.tangyForms.getResponse(this.caseId)
    const caseDefinitionFormId = caseInstance.form.id
    const caseDefinition = T.caseDefinition.caseDefinitions.find(cd => cd.formId === caseDefinitionFormId)
    this.participants = caseInstance.participants.map(participant => {
      let renderedListItem
      const roleDefinition = caseDefinition.caseRoles.find(role => role.id === participant.caseRoleId) 
      eval(`renderedListItem = \`${roleDefinition.templateListItem}\``)
      return {
        id: participant.id,
        listItem: renderedListItem 
      }
    })
    this.ready = true
  }

  onSubmit() {
      debugger
  }

  render() {
    return html`
      ${this.ready ? html`
        <tangy-location id="location"></tangy-location>
        <paper-input name="term"></paper-input>
        <paper-button id="submit" @click="${() => this.onsubmit()}">${t('SUBMIT')}</paper-button>
        <ul>
        ${this.participants.map(participant => html`
            <li @click="${() => this.onParticipantSelect(participant)}" participant-id="${participant.id}">${participant.listItem}</li>
        `)}
        </ul>
      `:``}
    `
  }

  onParticipantSelect(participant) {
    this.value = participant.id 
    this.dispatchEvent(new CustomEvent('participant-selected', { detail: { participant} }))
  }

}


customElements.define('find-participant-by-data-and-location', FindParticipantByLocationAndData);
