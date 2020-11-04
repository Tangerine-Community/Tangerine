import { IssueStatus } from './../../case/classes/issue.class';
import { Issue } from 'src/app/case/classes/issue.class';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { Router } from '@angular/router';
import { FormInfo } from './../../tangy-forms/classes/form-info.class';
import { GroupIssuesService } from './../services/group-issues.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as moment from 'moment'

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
  selector: 'app-group-issues',
  templateUrl: './group-issues.component.html',
  styleUrls: ['./group-issues.component.css']
})
export class GroupIssuesComponent implements OnInit {

  title = 'Issues'
  breadcrumbs:Array<Breadcrumb> = []
  formsInfo:Array<FormInfo>
  formTypesInfo:Array<any>
  groupId:string
  issues:Array<Issue>
  loading = false
  status:string = 'Open'
  type:string = 'issue'
  location:string
  @ViewChild('tangyLocation', {static: true}) tangyLocationEl:ElementRef
  @ViewChild('showClosedIssues', {static: true}) showClosedIssues:ElementRef
  @ViewChild('showConflicts', {static: true}) showConflicts:ElementRef
  @ViewChild('showMerged', {static: true}) showMerged:ElementRef
  @ViewChild('showOpen', {static: true}) showOpen:ElementRef

  // Query params.
  selector:any = {}
  limit = 20
  skip = 0
  moment
  
  constructor(
    private groupIssuesService:GroupIssuesService,
    private router: Router
  ) {
    this.moment = moment
  }

  async ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Issues'),
        url: 'issues'
      }
    ]
    this.groupId = window.location.hash.split('/')[2]
    this.query()
  }

  onSearchClick() {
    const location = this
      .tangyLocationEl
      .nativeElement
      .value
    if (!location || location.length === 0) {
    } else {
      const lastFilledOutNode = location.reduce((lastFilledOutNode, node) => node.value ? node : lastFilledOutNode)
      // this.selector[`location.${lastFilledOutNode.level}`] = lastFilledOutNode.value
      // Stick with the default value for this.location if no value for lastFilledOutNode.
      this.location = lastFilledOutNode.value
    }
    this.status = this.showClosedIssues.nativeElement.hasAttribute('checked') ? 'Closed' : 'Open'
    // Override if merged is checked
    this.status = this.showMerged.nativeElement.hasAttribute('checked') ? 'Merged' : this.status
    this.type = this.showConflicts.nativeElement.hasAttribute('checked') ? 'conflict' : 'issue'
    this.query()
  }

  onResetClick() {
    this.location = null
    this
      .tangyLocationEl
      .nativeElement
      .value = []
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
    // Examples:
    // http://localhost:5984/group-aaaff061-1565-424b-82d7-3eb2cdf11d93/_design/groupIssues/_view/groupIssues?start_key=["Open","\ufff0"]&end_key=["Open"]&descending=true
    // http://localhost:5984/group-aaaff061-1565-424b-82d7-3eb2cdf11d93/_design/groupIssues/_view/groupIssues?start_key=[%22Closed%22,%22conflict%22,%22\ufff0%22]&end_key=[%22Closed%22,%22conflict%22]&descending=true
    // http://localhost:5984/group-aaaff061-1565-424b-82d7-3eb2cdf11d93/_design/groupIssues/_view/groupIssues?start_key=[%22Open%22,%22issue%22,%22Ul4SMJaZ%22,%22\ufff0%22]&end_key=[%22Open%22,%22issue%22,%22Ul4SMJaZ%22]&descending=true
    const startkeyArray = this.location ? [this.status,this.type,this.location,"\ufff0"] : [this.status,this.type,"\ufff0"]
    const endKeyArray = this.location ? [this.status,this.type,this.location] : [this.status,this.type]
    let queryResults = await this.groupIssuesService.query(this.groupId, {
      fun: "groupIssues",
      include_docs: true,
      startkey:startkeyArray,
      endkey:endKeyArray,
      limit: this.limit,
      skip: this.skip,
      descending:true
    })
    this.issues = queryResults.map(issue => issue.doc)
    this.loading = false
  }

}
