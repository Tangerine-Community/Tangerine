import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LitElement, html, unsafeHtml } from 'lit-element';
import { t } from 'tangy-form/util/t.js'


export class FindParticipantByLocationAndData extends LitElement  {

  constructor() {
    super()
    this.value = {
      participantId: '',
      caseId: ''
    }
    this.participantInfos = []
    this.selectedParticipantLabel = ''
    this.participantIsSelected = false
  }

  static get properties() {
    return { 
      name: { type: String },
      value: { type: String },
      caseId: { type: String },
      participantInfos: { type: Array },
      ready: { type: Boolean },
      hasSearched: { type: Boolean },
      hidden: { type: Boolean },
      skipped: { type: Boolean }
    }
  }

  render() {
    return html`
      <style>
        ::host([hidden]), ::host([skipped]) {
          display:none;
        }
        #container {
          margin: 40px 0px 80px;
        }
        tangy-location {
          height: 260px;
        }
        paper-button {
          background: var(--accent-color);
          color: var(--accent-text-color);
          margin: 15px 0px;
        }
        li {
          margin: 20px 0px;
        }
        paper-input {
          margin: 0px 50px 0px 20px;
        }
        #search-button {
          float: right;
          margin: 15px 50px 0px 20px;
        }
        #search-results-title {
          margin-top: 60px;
        }
        .no-matches-found {
          margin-top: 30px;
        }
      </style>
      <div id="container">
      ${!this.participantIsSelected ? html`
        <h3>Participant Search</h3>
        <div class="label">${t('Location')}:</div>
        <tangy-location name="location"></tangy-location>
        <div class="label">${t('Name')}:</div>
        <paper-input name="term"></paper-input>
        <paper-button id="search-button" @click="${() => this.onSubmit()}">${t('SEARCH')}</paper-button>
        ${this.hasSearched ? html`
          <div id="search-results-title">${t('Search Results')}:</div>
          ${this.participantInfos.length === 0 ? html`
            <div class="no-matches-found">
              ${t('No matches found.')}
            </div>
          `: html`
            <ul>
              ${this.participantInfos.map(participantInfo => html`
                <li @click="${() => this.onParticipantSelect(participantInfo)}">${participantInfo.renderedListItem}</li>
              `)}
            </ul>
          `}
        `:``}
      `: html`
        <div class="selected-participant">
          ${t(`Selected Participant`)}: ${this.selectedParticipantLabel}
        </div>
        <div class="reset-button">
          <paper-button @click="${() => this.reset()}">${t(`RESET`)}</paper-button>
        </div>
      `}
      </div>
 
    `
  }

  async onSubmit() {
    this.hasSearched = true
    const locationKeys = this.shadowRoot.querySelector('[name="location"]').value.map(node => node.value)
    const term = this.shadowRoot.querySelector('[name="term"]').value
    const userDb = await T.user.getUserDatabase()
    const options = {
      startkey: [ T.case.case.form.id, ...locationKeys, term.toLocaleLowerCase() ].join(''),
      endkey: `${[ T.case.case.form.id, ...locationKeys, term.toLocaleLowerCase() ].join('')}\uffff`,
      limit: 25
    }
    const results = await userDb.query('findParticipantByCaseFormIdAndLocationAndData', options)
    const hits = results.rows
      .map(result => result.value)
      .reduce((acc, item) => {
        return acc.find(i => i.participantId === item.participantId)
          ? acc 
          : [ ...acc, item ]
      }, [])
    const participantInfos = []
    for (let hit of hits) {
      await T.caseDefinition.load()
      const caseInstance = await T.tangyForms.getResponse(hit.caseId)
      const caseDefinitionFormId = caseInstance.form.id
      const caseDefinition = T.caseDefinition.caseDefinitions.find(cd => cd.formId === caseDefinitionFormId)
      const participant = caseInstance.participants.find(participant => participant.id === hit.participantId)
      const data = participant.data
      let renderedListItem
      const roleDefinition = caseDefinition.caseRoles.find(role => role.id === participant.caseRoleId) 
      eval(`renderedListItem = \`${roleDefinition.templateListItem}\``)
      participantInfos.push({
        renderedListItem,
        ...hit
      })
    }
    this.participantInfos = participantInfos
  }

  onParticipantSelect(participantInfo) {
    this.value = {
      participantId: participantInfo.participantId,
      caseId: participantInfo.caseId
    }
    this.selectedParticipantLabel = participantInfo.renderedListItem
    this.participantIsSelected = true
    this.dispatchEvent(new CustomEvent('participant-selected', { detail: { participantInfo } }))
    this.dispatchEvent(new CustomEvent('change'))
  }

  reset() {
    this.value = {caseId: '', participantId: ''}
    this.participantIsSelected = false
    this.hasSearched = false
    this.dispatchEvent(new CustomEvent('change'))
  }

}


customElements.define('find-participant-by-location-and-data', FindParticipantByLocationAndData);
