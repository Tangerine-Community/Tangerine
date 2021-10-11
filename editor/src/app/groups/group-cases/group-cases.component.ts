import { GroupSearchComponent } from './../group-search/group-search.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { Router } from '@angular/router';
import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model.js';
import { TangyFormsInfoService } from './../../tangy-forms/tangy-forms-info-service';
import { FormInfo } from './../../tangy-forms/classes/form-info.class';
import { GroupResponsesService } from './../services/group-responses.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {HttpClient} from "@angular/common/http";

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
  selector: 'app-group-cases',
  templateUrl: './group-cases.component.html',
  styleUrls: ['./group-cases.component.css']
})
export class GroupCasesComponent implements OnInit {

  title = 'Cases'
  breadcrumbs:Array<Breadcrumb> = []
  formsInfo:Array<FormInfo>
  formTypesInfo:Array<any>
  groupId:string
  cases:Array<any>
  loading = false
  isSearching = false
  @ViewChild('searchResults', {static: true}) searchResults: ElementRef
  @ViewChild('groupSearch', {static: true}) groupSearch: GroupSearchComponent

  // Query params.
  selector:any = {}
  limit = 10
  skip = 0

  constructor(
    private groupResponsesService:GroupResponsesService,
    private formsInfoService: TangyFormsInfoService,
    private router: Router,
    private httpClient: HttpClient,
  ) { }

  async ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Cases'),
        url: 'cases'
      }
    ]
    this.groupId = window.location.hash.split('/')[2]
    this.formsInfo = await this.formsInfoService.getFormsInfo()
    this.formTypesInfo = FORM_TYPES_INFO
    this.searchResults.nativeElement.addEventListener('click', (event) => this.onSearchResultClick(event.target))
    this.selector = {
      "type": "case"
    }
    this.groupSearch.isSearching$.subscribe(() => this.isSearching = true) 
    this.groupSearch.stoppedSearching$.subscribe(() => this.isSearching = false) 
    this.query()
  }

  onNextClick() {
    this.skip = this.skip + this.limit
    this.query()
  }

  onPreviousClick() {
    this.skip = this.skip - this.limit
    this.query()
  }

  async query() {
    this.loading = true
    this.cases = <Array<any>>await this.httpClient.post(`/group-responses/search/${this.groupId}`, { phrase: '' }).toPromise()
    this.renderSearchResults()
    this.loading = false
  }

  formResponseToSearchDoc(doc, formInfo:FormInfo) {
    const searchDoc = {
      _id: doc._id,
      formId: doc.formId,
      formType: formInfo.type ? formInfo.type : 'form',
      lastModified: doc.lastModified,
      tangerineModifiedOn: new Date(doc.lastModified).getTime(),
      variables: {}
    }
    const response = new TangyFormResponseModel(doc)
    for (const variableName of formInfo.searchSettings.variablesToIndex) {
      // @TODO This only supports text values. If it's an array, should reduce.
      searchDoc.variables[variableName] = response.inputsByName[variableName]
        ? response.inputsByName[variableName].value
        : ''
    }
    return searchDoc
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

  goTo(url) {
    this.router.navigateByUrl(url)
  }

  renderSearchResults() {
    this.searchResults.nativeElement.innerHTML = ""
    let searchResultsMarkup = ``
    for (const searchDoc of this.cases) {
      const formTypeInfo = this.formTypesInfo.find(formTypeInfo => formTypeInfo.id === searchDoc.formType)
      const formInfo = this.formsInfo.find(formInfo => formInfo.id === searchDoc.formId)
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
  }

}
