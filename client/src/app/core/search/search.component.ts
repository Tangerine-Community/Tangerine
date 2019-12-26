import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SearchDoc, SearchService } from 'src/app/shared/_services/search.service';
import { UserService } from 'src/app/shared/_services/user.service';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { Router } from '@angular/router';
import { SearchBarcodeComponent } from './search-barcode/search-barcode.component';

// @TODO Turn this into a service that gets this info from a hook.
export const FORM_TYPES_INFO = [
  {
    id: 'form',
    newFormResponseLinkTemplate: '/tangy-forms-player/${formId}',
    resumeFormResponseLinkTemplate: '/tangy-forms-player?formId=${formId}&responseId=${response._id}',
    iconTemplate: '${response && response.complete ? `assignment-turned-in` : `assignment`}'
  },
  {
    id: 'case',
    newFormResponseLinkTemplate: '/case-new/${formId}',
    resumeFormResponseLinkTemplate: '/case/${response._id}',
    iconTemplate: '${response && response.complete ? `folder-special` : `folder`}'
  }
]

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  @ViewChild('searchBar') searchBar: ElementRef
  @ViewChild('searchResults') searchResults: ElementRef
  @ViewChild('scanner') scanner: SearchBarcodeComponent
  onSearch$ = new Subject()
  didSearch$ = new Subject()
  searchReady$ = new Subject()
  navigatingTo$ = new Subject()
  searchDocs:Array<SearchDoc>
  username:string
  formsInfo:Array<FormInfo>
  formTypesInfo:Array<any>
  showScan = false

  constructor(
    private searchService: SearchService,
    private userService: UserService,
    private formsInfoService: TangyFormsInfoService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.formsInfo = await this.formsInfoService.getFormsInfo()
    this.username = this.userService.getCurrentUser()
    this.formTypesInfo = FORM_TYPES_INFO 
    this.onSearch$
      .pipe(debounceTime(300))
      .subscribe((searchString:string) => this.onSearch(searchString))
    this
      .searchBar
      .nativeElement
      .addEventListener('keyup', event => this.onSearch$.next(event.target.value))
    this.searchResults.nativeElement.addEventListener('click', (event) => this.onSearchResultClick(event.target))
    this.searchReady$.next(true)
    this.onSearch('')
  }

  async onSearch(searchString) {
    this.searchResults.nativeElement.innerHTML = "Loading..."
    this.searchDocs = await this.searchService.search(this.username, searchString)
    this.searchResults.nativeElement.innerHTML = ""
    let searchResultsMarkup = ``
    for (const searchDoc of this.searchDocs) {
      const userDb = await this.userService.getUserDatabase(this.userService.getCurrentUser())
      const response = await userDb.get(searchDoc._id)
      const formTypeInfo = this.formTypesInfo.find(formTypeInfo => formTypeInfo.id === searchDoc.formType)
      const formInfo = this.formsInfo.find(formInfo => formInfo.id === searchDoc.formId)
      const formId = formInfo.id
      searchResultsMarkup += `
        <paper-icon-item class="search-result" open-link="${eval(`\`${formTypeInfo.resumeFormResponseLinkTemplate}\``)}">
          <iron-icon icon="${eval(`\`${formTypeInfo.iconTemplate}\``)}" slot="item-icon"></iron-icon> 
          <paper-item-body two-line>
            <div>
              ${eval(`\`${formInfo.searchSettings.primaryTemplate ? formInfo.searchSettings.primaryTemplate : response._id}\``)}
            </div>
            <div secondary>
              ${eval(`\`${formInfo.searchSettings.secondaryTemplate ? formInfo.searchSettings.secondaryTemplate : formInfo.title}\``)}
            </div>
          </paper-item-body>
        </paper-icon-item>
      `
    }
    this.searchResults.nativeElement.innerHTML = searchResultsMarkup
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
    this.onSearch(scanSearchString)
    this.searchBar.nativeElement.value = scanSearchString
  }

  onScanError() {

  }

  onScanCancel() {
    this.showScan = false

  }
}
