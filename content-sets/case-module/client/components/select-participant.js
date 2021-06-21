import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LitElement, html, unsafeHtml } from 'lit-element';
import { t } from 'tangy-form/util/t.js'
import { combTranslations } from 'translation-web-component/util.js'

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
      label: { type: String},
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
    let householdParticipants = caseInstance.participants.filter(participant => 
        (participant.caseRoleId !== 'household-role') && 
        !participant.data.is_outmigrated && !participant.data.relocated && 
        participant.data.is_alive)
    this.participants = householdParticipants.map(participant => {
      let renderedListItem
      const roleDefinition = caseDefinition.caseRoles.find(role => role.id === participant.caseRoleId) 
      eval(`renderedListItem = \`${combTranslations(roleDefinition.templateSearchItem)}\``)
      return {
        id: participant.id,
        listItem: renderedListItem 
      }
    })
    this.ready = true
  }

  render() {
    return html`
      <div id="container">
      ${this.ready ? 
        html`
          ${this.participants.length > 0 ? 
            html`
              <h4>${combTranslations(this.label)}</h4>
              <ul>
              ${this.participants.map(participant => 
                html`
                  <li @click="${() => this.onParticipantSelect(participant)}" participant-id="${participant.id}">${participant.listItem}</li>
                `)}
              </ul>
            ` : 
            html`
              <div id="container">
                <h4>${t(`No participants found in the case.`)}</h4>
              </div>
            `
          }
        ` : ``}`
  }

  onParticipantSelect(participant) {
    this.value = participant.id 
    this.dispatchEvent(new CustomEvent('participant-selected', { detail: { participant} }))
  }

}


customElements.define('select-participant', SelectParticipant);
