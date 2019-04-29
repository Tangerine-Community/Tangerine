import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SearchDoc, SearchService } from 'src/app/shared/_services/search.service';
import { UserService } from 'src/app/shared/_services/user.service';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  @ViewChild('searchBar') searchBar: ElementRef
  @ViewChild('searchResults') searchResults: ElementRef
  onSearch$ = new Subject()
  searchDocs:Array<SearchDoc>
  username:string
  formsInfo:Array<FormInfo>
  formTypesInfo:Array<any>

  constructor(
    private searchService: SearchService,
    private userService: UserService,
    private formsInfoService: TangyFormsInfoService,
    private router: Router
  ) { }

  async ngOnInit() {
    debugger
    this.formsInfo = await this.formsInfoService.getFormsInfo()
    this.username = this.userService.getCurrentUser()
    // @TODO Turn this into a service that gets this info from a hook.
    this.formTypesInfo = [
      {
        id: 'form',
        newFormResponseLinkTemplate: '/tangy-forms-player/${formId}',
        resumeFormResponseLinkTemplate: '/tangy-forms-player/${formId}/${formResponseId}',
        iconTemplate: '${formResponse && formResponse.complete ? `assignment-turned-in` : `assignment`}'
      },
      {
        id: 'case',
        newFormResponseLinkTemplate: '/case-new/${formId}',
        resumeFormResponseLinkTemplate: '/case/${formResponseId}',
        iconTemplate: '${formResponse && formResponse.complete ? `folder-special` : `folder`}'
      }
    ]
    this.onSearch$
      .pipe(debounceTime(300))
      .subscribe((searchString:string) => this.onSearch(searchString))
    this
      .searchBar
      .nativeElement
      .addEventListener('change', event => this.onSearch$.next(event.target.value))
    this.searchResults.nativeElement.addEventListener('click', (event) => this.onSearchResultClick(event.target))
  }

  async onSearch(searchString) {
    this.searchResults.nativeElement.innerHTML = "Loading..."
    this.searchDocs = await this.searchService.search(this.username, searchString)
    this.searchResults.nativeElement.innerHTML = ""
    let searchResultsMarkup = ``
    for (const searchDoc of this.searchDocs) {
      const formInfo = this.formsInfo.find(formInfo => formInfo.id === searchDoc.formId)
      const formTypeInfo = this.formTypesInfo.find(formTypeInfo => formTypeInfo.id === searchDoc.formType)
      const formResponseId = searchDoc._id
      const formId = searchDoc.formId
      searchResultsMarkup += `
        <paper-icon-item class="search-result" open-link="${eval(`return \`${formTypeInfo.resumeFormResponseLinkTemplate}\``)}">
          <iron-icon icon="${eval(`return \`${formTypeInfo.iconTemplate}\``)}" slot="item-icon"></iron-icon> 
          <paper-item-body two-line>
            <div>
              ${eval(`return \`${formInfo.searchSettings.primaryTemplate}\``)}
            </div>
            <div secondary>
              ${eval(`return \`${formInfo.searchSettings.secondaryTemplate}\``)}
            </div>
          </paper-item-body>
        </paper-icon-item>
      `
    }
    this.searchResults.nativeElement.innerHTML = searchResultsMarkup
  }

  onSearchResultClick(element) {
    let parentEl = undefined
    let currentEl = element
    while (!parentEl) {
      if (currentEl.hasAttribute('open-link')) {
        parentEl = currentEl
      }
    }
    this.router.navigate(currentEl.getAttribute('open-link').split('\/'))
  }

}
