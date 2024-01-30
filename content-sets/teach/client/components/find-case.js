import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LitElement, html } from 'lit-element';
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

export class FindCase extends LitElement  {

  constructor() {
    super()
    this.onSearch$ = new Subject()
    this.didSearch$ = new Subject()
    this.searchReady$ = new Subject()
    this.navigatingTo$ = new Subject()
    this.searchDocs = []
    this.username = ''
    this.formsInfo = []
    this.formTypesInfo = []
    this.showScan = false
    this.value = {
      caseId: '',
      participantId: ''
    }
  }

  async connectedCallback() {
    super.connectedCallback()
    this.formsInfo = await T.tangyFormsInfo.getFormsInfo()
    this.username = T.user.getCurrentUser()
    this.formTypesInfo = FORM_TYPES_INFO
    this.onSearch$
      .pipe(debounceTime(300))
      .subscribe((searchString) => {
        //this.searchResults.nativeElement.innerHTML = 'Searching...'
        this.onSearch(searchString)
      })
    //this.searchResults.nativeElement.addEventListener('click', (event) => this.onSearchResultClick(event.target))
    this.searchReady$.next(true)
    this.onSearch('')
  }

  render() {
    return html`
      <paper-input id="search-bar" name="search-bar" label="${t('Search cases')}" @keyup="${(event) => this.onSearchKeyUp(event)}"></paper-input>
      <div id="search-results">
        Loading...
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
    this.searchDocs = await T.search.search(this.username, searchString)
    let searchResultsMarkup = ``
    if (this.searchDocs.length === 0) {
      searchResultsMarkup = `
        <span style="padding: 15px">
          ${t('No results.')}
        </span>
      `
    }
    for (const searchDoc of this.searchDocs) {
      const formTypeInfo = this.formTypesInfo.find(formTypeInfo => formTypeInfo.id === searchDoc.formType)
      const formInfo = this.formsInfo.find(formInfo => formInfo.id === searchDoc.formId)
      const formId = formInfo.id
      searchResultsMarkup += `
      <div class="icon-list-item search-result" case-id="${searchDoc._id}">
        <mwc-icon slot="item-icon">${eval(`\`${formTypeInfo.iconTemplate}\``)}</mwc-icon>
        <div>
          <div> ${eval(`\`${formInfo.searchSettings.primaryTemplate ? formInfo.searchSettings.primaryTemplate : searchDoc._id}\``)}</div>
          <div secondary>
          ${eval(`\`${formInfo.searchSettings.secondaryTemplate ? formInfo.searchSettings.secondaryTemplate : formInfo.title}\``)}
          </div>
        </div>
      </div>
      `
    }
    this.shadowRoot.querySelector('#search-results').innerHTML = searchResultsMarkup
    this.shadowRoot.querySelectorAll('.search-result').forEach((element) => element.addEventListener('click', (event) => this.onSearchResultClick(event)))
    this.didSearch$.next(true)
  }

  scan() {
    this.showScan = true
    this.scanner.startScanning()
  }

  onSearchResultClick(event) {
    let element = event.currentTarget
    let parentEl = undefined
    let currentEl = element
    while (!parentEl) {
      if (currentEl.hasAttribute('case-id')) {
        parentEl = currentEl
      } else {
        currentEl = currentEl.parentElement
      }
    }
    this.value = currentEl.getAttribute('case-id')
    this.dispatchEvent(new CustomEvent('case-selected'))
  }

  focusOnFind() {
    this
      .searchBar
      .nativeElement
      .focus()
  }

  goTo(url) {
    this.navigatingTo$.next(url)
    //this.router.navigateByUrl(url)
  }

  onScanChange(scanSearchString) {
      this.showScan = false
      this.onSearch(scanSearchString)
      //this.searchBar.nativeElement.value = scanSearchString
  }

  onScanError() {

  }

  onScanCancel() {
    this.showScan = false

  }
}


customElements.define('find-case', FindCase);
