import { IssueStatus } from './../../case/classes/issue.class';
import { Issue } from 'src/app/case/classes/issue.class';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { Router } from '@angular/router';
import { FormInfo } from './../../tangy-forms/classes/form-info.class';
import { GroupResponsesService } from './../services/group-responses.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
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
  @ViewChild('tangyLocation', {static: true}) tangyLocationEl:ElementRef
  @ViewChild('showClosedIssues', {static: true}) showClosedIssues:ElementRef
  @ViewChild('showConflicts', {static: true}) showConflicts:ElementRef

  // Query params.
  selector:any = {}
  limit = 10
  skip = 0
  moment
  filterConflictsSelector = {
    "$elemMatch": {
      "data.conflict": {
        "$exists": false
      }
    }
  }
  showConflictsSelector = {
    "$elemMatch": {
      "data.conflict": {
        "$ne": null
      }
    }
  }
  showMergedOrClosedIssuesSelector = {
    "type": "issue",
    "tangerineModifiedOn": {"$gte": 0},
    "$or": [
      { "status": IssueStatus.Closed },
      { "status": IssueStatus.Merged }
    ]
  }
  showOpenIssuesSelector = {
    "type": "issue",
    "tangerineModifiedOn": {"$gte": 0},
    "$or": [
      { "status": IssueStatus.Closed },
      { "status": IssueStatus.Merged }
    ]
  }

  constructor(
    private groupResponsesService:GroupResponsesService,
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
    this.selector = this.showClosedIssues.nativeElement.hasAttribute('checked') ? this.showMergedOrClosedIssuesSelector : this.showOpenIssuesSelector
    // this.showConflicts.nativeElement.hasAttribute('checked') ? this.selector : this.selector["events"] = this.filterConflictsSelector
    if (!this.showConflicts.nativeElement.hasAttribute('checked')) {
      this.selector["events"] = this.filterConflictsSelector
    } else {
      this.selector["events"] = this.showConflictsSelector
    }
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
      // this.selector = {
      //   'type': 'issue',
      //   'status': this.showClosedIssues.nativeElement.hasAttribute('checked') ? IssueStatus.Closed : IssueStatus.Open,
      //   [`location.${lastFilledOutNode.level}`]: lastFilledOutNode.value
      // }
      this.selector[`location.${lastFilledOutNode.level}`] = lastFilledOutNode.value
    }
    // this.selector = this.showConflicts.nativeElement.hasAttribute('checked') ? this.selector : this.selector["events"] = this.filterConflictsSelector
    if (!this.showConflicts.nativeElement.hasAttribute('checked')) {
      this.selector["events"] = this.filterConflictsSelector
    } else {
      this.selector["events"] = this.showConflictsSelector
    }
    this.query()
  }

  onResetClick() {
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
    this.issues = await this.groupResponsesService.query(this.groupId, {
      selector: this.selector,
      limit: this.limit,
      skip: this.skip,
      sort: [{'tangerineModifiedOn':'desc'}]
    })
    this.loading = false
  }

}
