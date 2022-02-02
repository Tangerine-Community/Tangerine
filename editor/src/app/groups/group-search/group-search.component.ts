import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { Router } from '@angular/router';
//import { SearchBarcodeComponent } from './search-barcode/search-barcode.component';
import { t } from 'tangy-form/util/t.js'
import { subscribeToPromise } from 'rxjs/internal-compatibility';
import {SearchDoc, SearchService} from "../../shared/_services/search.service";
import { v4 as UUID } from 'uuid';

// @TODO Turn this into a service that gets this info from a hook.
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

class Queue {

  activeTicket:string

  getTicket() {
    const ticket = UUID()
    this.activeTicket = ticket
    return ticket
  }

}

@Component({
  selector: 'app-group-search',
  templateUrl: './group-search.component.html',
  styleUrls: ['./group-search.component.css']
})
export class GroupSearchComponent implements OnInit {

  @ViewChild('searchBar', {static: true}) searchBar: ElementRef
  @ViewChild('searchResults', {static: true}) searchResults: ElementRef
  @ViewChild('viewArchived', {static: true}) viewArchived: ElementRef
  onSearch$ = new Subject()
  didSearch$ = new Subject()
  stoppedSearching$ = new Subject()
  searchReady$ = new Subject()
  navigatingTo$ = new Subject()
  searchDocs:Array<SearchDoc> = []
  username:string
  formsInfo:Array<FormInfo>
  formTypesInfo:Array<any>
  showScan = false
  currentSearchId:string
  moreClickCount = 0
  searchString = ''
  resultsPerPage = 10
  thereIsMore = true
  isLoading = true
  searchType = 'search'
  searchQueue:Queue = new Queue()

  constructor(
    private searchService: SearchService,
    private formsInfoService: TangyFormsInfoService,
    private httpClient: HttpClient,
    private router: Router
  ) {
  }

  async ngOnInit() {
    this.formsInfo = await this.formsInfoService.getFormsInfo()
    this.formTypesInfo = FORM_TYPES_INFO
    this.onSearch$
      .pipe(debounceTime(1200))
      .subscribe((searchString:string) => {
        this.searchResults.nativeElement.innerHTML = 'Searching...'
        this.onSearch(searchString)
      })
    this
      .searchBar
      .nativeElement
      .addEventListener('keyup', event => {
        const searchString = event.target.value
        if (searchString.length > 2 || searchString.length === 0) {
          this.isLoading = true
          this.onSearch$.next(event.target.value)
        } else {
          this.searchResults.nativeElement.innerHTML = `
            <span style="padding: 25px">
              ${t('Enter more than two characters...')}
            </span>
          `
        }
      })
    this
      .viewArchived
      .nativeElement
      .addEventListener('change', async event => {
        this.searchType = this.viewArchived.nativeElement.hasAttribute('checked') ? 'archived' : 'search'
        this.isLoading = true
        this.onSearch$.next("") 
      })
    this.searchResults.nativeElement.addEventListener('click', (event) => this.onSearchResultClick(event.target))
    this.searchReady$.next(true)
    this.onSearch('')
  }

  async loadMore() {
    const ticket = this.searchQueue.getTicket()
    this.isLoading = true
    this.moreClickCount++
    this.searchDocs = await this.searchService.search(this.username, this.searchString, this.searchType, this.resultsPerPage, this.resultsPerPage * this.moreClickCount)
    let searchResultsMarkup = ``
    if (this.searchDocs.length < this.resultsPerPage) {
      this.thereIsMore = false
    }
    for (const searchDoc of this.searchDocs) {
      searchResultsMarkup += this.templateSearchResult(searchDoc)
    }
    const el = document.createElement('div')
    el.innerHTML = searchResultsMarkup
    if (ticket !== this.searchQueue.activeTicket) return
    this.searchResults.nativeElement.append(el)
    this.isLoading = false
    this.didSearch$.next(true)
  }

  async onSearch(searchString) {
    if (searchString === '') {
      this.searchResults.nativeElement.innerHTML = '<span style="padding: 25px">' + t('Enter text in the \'Search Cases\' field above.') + '</span>'
      this.isLoading = false
      this.thereIsMore = false
      this.stoppedSearching$.next(true)
      return 
    }
    const ticket = this.searchQueue.getTicket()
    this.moreClickCount = 0
    this.thereIsMore = true
    this.searchString = searchString
    this.searchResults.nativeElement.innerHTML = ""
    this.searchDocs = await this.searchService.search(this.username, searchString,this.searchType, this.resultsPerPage, 0)
    this.searchResults.nativeElement.innerHTML = ""
    let searchResultsMarkup = ``
    if (this.searchDocs.length === 0) {
      searchResultsMarkup = `
        <span style="padding: 25px">
          ${t('No results.')}
        </span>
      `
      this.thereIsMore = false
    }
    if (this.searchDocs.length < this.resultsPerPage) {
      this.thereIsMore = false
    }
    for (const searchDoc of this.searchDocs) {
      searchResultsMarkup += this.templateSearchResult(searchDoc)
    }
    if (ticket !== this.searchQueue.activeTicket) return
    this.searchResults.nativeElement.innerHTML = searchResultsMarkup
    this.isLoading = false
    this.didSearch$.next(true)
  }

  templateSearchResult(searchDoc) {
    const formTypeInfo = this.formTypesInfo.find(formTypeInfo => formTypeInfo.id === searchDoc.formType)
    const formInfo = this.formsInfo.find(formInfo => formInfo.id === searchDoc.formId)
    const formId = formInfo.id
    return `
      <div class="icon-list-item search-result" open-link="${eval(`\`${formTypeInfo.resumeFormResponseLinkTemplate}\``)}">
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

  // private async searchAndRender(searchString) {
  //   this.isSearching$.next(true)
  //   this.searchResults.nativeElement.innerHTML = "Loading..."
  //   this.searchDocs = <Array<any>>await this.httpClient.post(`/group-responses/search/${window.location.pathname.split('/')[2]}`, {
  //     phrase: searchString,
  //     index: searchType
  //   }).toPromise()
  //   this.searchResults.nativeElement.innerHTML = ""
  //   let searchResultsMarkup = ``
  //   if (this.searchDocs.length === 0) {
  //     searchResultsMarkup = `
  //       <span style="padding: 25px">
  //         ${t('No results.')}
  //       </span>
  //     `
  //   }
  //   for (const searchDoc of this.searchDocs) {
  //     const formTypeInfo = this.formTypesInfo.find(formTypeInfo => formTypeInfo.id === searchDoc.formType)
  //     const formInfo = this.formsInfo.find(formInfo => formInfo.id === searchDoc.formId)
  //     searchResultsMarkup += `
  //     <div class="icon-list-item search-result" open-link="${eval(`\`${formTypeInfo.resumeFormResponseLinkTemplate}\``)}">
  //       <mwc-icon slot="item-icon">${eval(`\`${formTypeInfo.iconTemplate}\``)}</mwc-icon>
  //       <div>
  //         <div> ${eval(`\`${formInfo.searchSettings.primaryTemplate ? formInfo.searchSettings.primaryTemplate : searchDoc._id}\``)}</div>
  //         <div secondary>
  //         ${eval(`\`${formInfo.searchSettings.secondaryTemplate ? formInfo.searchSettings.secondaryTemplate : formInfo.title}\``)}
  //         </div>
  //       </div>
  //     </div>
  //     `
  //   }
  //   this.searchResults.nativeElement.innerHTML = searchResultsMarkup
  //   this.didSearch$.next(true)
  // }

  scan() {
    this.showScan = true
    //this.scanner.startScanning()
  }

  onSearchResultClick(element) {
    let parentEl = undefined
    let currentEl = element
    while (!parentEl) {
      if (currentEl.hasAttribute('open-link')) {
        parentEl = currentEl
      } else {
        currentEl = currentEl.parentElement
      }
    }
    this.goTo(currentEl.getAttribute('open-link'))
  }

  focusOnFind() {
    this
      .searchBar
      .nativeElement
      .focus()
  }

  goTo(url) {
    this.navigatingTo$.next(url)
    this.router.navigateByUrl(url)
  }

  onScanChange(scanSearchString) {
      this.showScan = false
      this.onSearch(scanSearchString)
      this.searchBar.nativeElement.value = scanSearchString
  }

  onScanError() {

  }

  onScanCancel() {
    this.showScan = false

  }
}
