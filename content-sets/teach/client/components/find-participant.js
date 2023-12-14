import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LitElement, html, customElement, property } from 'lit-element';
import { t } from 'tangy-form/util/t.js'

export const FORM_TYPES_INFO = [
  {
    id: 'form',
    newFormResponseLinkTemplate: '/tangy-forms-player/${formId}',
    resumeFormResponseLinkTemplate: '/tangy-forms-player?formId=${formId}&responseId=${searchDoc._id}',
    iconTemplate: '${searchDoc && searchDoc.variables.complete ? `assignment-turned-in` : `assignment`}'
  },
  {
    id: 'case',
    newFormResponseLinkTemplate: '/case-new/${formId}',
    resumeFormResponseLinkTemplate: '/case/${searchDoc._id}',
    iconTemplate: '${searchDoc && searchDoc.variables.complete ? `folder-special` : `folder`}'
  }
]

export class FindParticipant extends LitElement  {

  constructor() {
    this.onSearch$ = new Subject()
    this.didSearch$ = new Subject()
    this.searchReady$ = new Subject()
    this.navigatingTo$ = new Subject()
    this.selectedListItem = ''
    this.selectedSearchDoc = undefined
    this.searchDocs = []
    this.username = ''
    this.formsInfo = []
    this.formTypesInfo = []
    this.showScan = false
    this.value = {
      caseId: '',
      participantId: ''
    }
    this.required = false
  }

  async connectedCallback() {
    super.connectedCallback()
    this.formsInfo = await window['T'].tangyFormsInfo.getFormsInfo()
    this.username = window['T'].user.getCurrentUser()
    this.formTypesInfo = FORM_TYPES_INFO
    await window['T'].caseDefinition.load()
    this.onSearch$
      .pipe(debounceTime(300))
      .subscribe((searchString) => {
        this.onSearch(searchString)
      })
    this.searchReady$.next(true)
  }

  reset() {
    this.selectedListItem = ''
    this.value = {
      caseId: '',
      participantId: ''
    }
  }

  render() {
    return html`
      <style>
        #container {
          margin: 40px 0px;
        }
        .reset-button {
          background: var(--accent-color);
          color: var(--accent-text-color);
          margin: 15px 0px;
        }
      </style>
      <div id="container">
        ${this.selectedListItem ? html`
          <div class=selected-list-item-title>
            ${t('Selected Participant')}:
          </div>
          <div class="selected-list-item">
            ${unsafeHTML(this.selectedListItem)}
          </div>
          <paper-button class="reset-button" @click="${() => this.reset()}">${t('RESET')}</paper-button>
        `: html`
          <paper-input id="search-bar" name="search-bar" label="${t('Search participants')}" @keyup="${(event) => this.onSearchKeyUp(event)}"></paper-input>
          <div id="search-results">
          </div>
        `}
      </div>
    `
  }

  onSearchKeyUp(event) {
    const searchString = event.target.value
    if (searchString.length > 2) {
      this.onSearch$.next(event.target.value)
    } else if (searchString.length === 0) {
      this.onSearch$.next('')
    } else {
      this.shadowRoot.querySelector('#search-results').innerHTML = `
        <span style="padding: 15px">
          ${t('Enter more than two characters...')}
        </span>
      `
    }
  }

  async onSearch(searchString) {
    this.shadowRoot.querySelector('#search-results').innerHTML = "Loading..."
    this.searchDocs = await window['T'].case.searchForParticipant(this.username, searchString)
    let searchResultsMarkup = ``
    if (this.searchDocs.length === 0) {
      searchResultsMarkup = `
        <span style="padding: 15px">
          ${t('No results.')}
        </span>
      `
    }
    for (const searchDoc of this.searchDocs) {
      const caseDefinitionFormId = searchDoc.case.form.id
      const caseDefinition = window['T'].caseDefinition.caseDefinitions.find(cd => cd.formId === caseDefinitionFormId)
      const participant = searchDoc.participant
      const caseInstance = searchDoc.case
      const roleDefinition = caseDefinition.caseRoles.find(role => role.id === participant.caseRoleId) 
      let renderedListItem = ''
      eval(`renderedListItem = \`${roleDefinition.templateListItem}\``)
      searchResultsMarkup += `
        <div class="icon-list-item search-result" participant-id="${searchDoc.participantId}" case-id="${searchDoc.caseId}">
          <mwc-icon slot="item-icon">person</mwc-icon>
          <div>
            <div> ${renderedListItem}</div>
            <div secondary>
            </div>
          </div>
        </div>
      `
    }
    this.shadowRoot.querySelector('#search-results').innerHTML = searchResultsMarkup
    this.shadowRoot.querySelectorAll('.search-result').forEach((element) => element.addEventListener('click', (event) => this.onSearchResultClick(event)))
    this.didSearch$.next(true)
  }

  onSearchResultClick(event) {
    let element = event.currentTarget
    let parentEl = undefined
    let currentEl = element
    while (!parentEl) {
      if (currentEl.hasAttribute('participant-id')) {
        parentEl = currentEl
      } else {
        currentEl = currentEl.parentElement
      }
    }
    this.value = {
      participantId: currentEl.getAttribute('participant-id'),
      caseId: currentEl.getAttribute('case-id')
    }
    const searchDoc = this.searchDocs.find(s => s.participantId === this.value.participantId)
    const caseDefinitionFormId = searchDoc.case.form.id
    const caseDefinition = window['T'].caseDefinition.caseDefinitions.find(cd => cd.formId === caseDefinitionFormId)
    const participant = searchDoc.participant
    const caseInstance = searchDoc.case
    const roleDefinition = caseDefinition.caseRoles.find(role => role.id === participant.caseRoleId) 
    let renderedListItem = ''
    eval(`renderedListItem = \`${roleDefinition.templateListItem}\``)
    this.selectedListItem = renderedListItem
    this.dispatchEvent(new CustomEvent('participant-selected'))
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
