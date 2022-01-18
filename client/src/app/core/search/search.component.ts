import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SearchDoc, SearchService } from 'src/app/shared/_services/search.service';
import { UserService } from 'src/app/shared/_services/user.service';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { Router } from '@angular/router';
import { SearchBarcodeComponent } from './search-barcode/search-barcode.component';
import { t } from 'tangy-form/util/t.js'
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

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  @ViewChild('searchBar', {static: true}) searchBar: ElementRef
  @ViewChild('searchResults', {static: true}) searchResults: ElementRef
  @ViewChild('scanner', {static: true}) scanner: SearchBarcodeComponent
  onSearch$ = new Subject()
  didSearch$ = new Subject()
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

  constructor(
    private searchService: SearchService,
    private userService: UserService,
    private formsInfoService: TangyFormsInfoService,
    private router: Router
  ) {
  }

  async ngOnInit() {
    this.formsInfo = await this.formsInfoService.getFormsInfo()
    this.username = this.userService.getCurrentUser()
    this.formTypesInfo = FORM_TYPES_INFO
    this.onSearch$
      .pipe(debounceTime(1200))
      .subscribe((searchString:string) => {
        this.currentSearchId = UUID() 
        this.searchResults.nativeElement.innerHTML = 'Searching...'
        this.onSearch(searchString, `${this.currentSearchId}`)
      })
    this
      .searchBar
      .nativeElement
      .addEventListener('keyup', event => {
        this.isLoading = true
        this.searchResults.nativeElement.innerHTML = ``
        this.onSearch$.next(event.target.value)
      })
    this.searchResults.nativeElement.addEventListener('click', (event) => this.onSearchResultClick(event.target))
    this.searchReady$.next(true)
    this.currentSearchId = UUID()
    this.onSearch('', `${this.currentSearchId}`)
  }

  async loadMore() {
    this.isLoading = true
    const searchId = UUID()
    this.currentSearchId = `${searchId}`
    this.moreClickCount++
    this.searchDocs = await this.searchService.search(this.username, this.searchString, this.resultsPerPage, this.resultsPerPage * this.moreClickCount)
    // Avoid race conditions where an earlier search call may come back after a more recent search call because the earlier search call had
    // to wait for indexing... Or just bad luck.
    if (this.currentSearchId !== searchId) return
    let searchResultsMarkup = ``
    if (this.searchDocs.length < this.resultsPerPage) {
      this.thereIsMore = false
    }
    for (const searchDoc of this.searchDocs) {
      const formTypeInfo = this.formTypesInfo.find(formTypeInfo => formTypeInfo.id === searchDoc.formType)
      const formInfo = this.formsInfo.find(formInfo => formInfo.id === searchDoc.formId)
      const formId = formInfo.id
      searchResultsMarkup += `
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
    const previousResults = `${this.searchResults.nativeElement.innerHTML}`
    this.searchResults.nativeElement.innerHTML = `${previousResults}${searchResultsMarkup}`
    this.isLoading = false
    this.didSearch$.next(true)   
  }

  async onSearch(searchString:string, searchId:string) {
    this.moreClickCount = 0
    this.thereIsMore = true 
    this.searchString = searchString
    this.searchResults.nativeElement.innerHTML = ""
    this.searchDocs = await this.searchService.search(this.username, searchString, this.resultsPerPage, 0)
    // Avoid race conditions where an earlier search call may come back after a more recent search call because the earlier search call had
    // to wait for indexing... Or just bad luck.
    if (this.currentSearchId !== searchId) return
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
      const formTypeInfo = this.formTypesInfo.find(formTypeInfo => formTypeInfo.id === searchDoc.formType)
      const formInfo = this.formsInfo.find(formInfo => formInfo.id === searchDoc.formId)
      const formId = formInfo.id
      searchResultsMarkup += `
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
    this.searchResults.nativeElement.innerHTML = searchResultsMarkup
    this.isLoading = false
    this.didSearch$.next(true)
  }

  scan() {
    this.showScan = true
    this.scanner.startScanning()
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
      this.currentSearchId = UUID()
      this.onSearch(scanSearchString, `${this.currentSearchId}`)
      this.searchBar.nativeElement.value = scanSearchString
  }

  onScanError() {

  }

  onScanCancel() {
    this.showScan = false

  }
}
