import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model.js';
import { TangyFormsPlayerComponent } from './../../../tangy-forms/tangy-forms-player/tangy-forms-player.component';
import { UserService } from './../../../core/auth/_services/user.service';
import { CommonModule } from '@angular/common';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { IssueEventType, IssueStatus } from './../../classes/issue.class';
import { Issue } from '../../classes/issue.class';
import { Router, ActivatedRoute } from '@angular/router';
import { CasesService } from './../../services/cases.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CaseService } from '../../services/case.service';
import { Route } from '@angular/compiler/src/core';
import moment from 'moment';

const IssueEventTypeIconMap = {
  [IssueEventType.Comment]: 'comment',
  [IssueEventType.FormResponseRevision]: 'call_split',
  [IssueEventType.FormResponseMerge]: 'call_merge',
  [IssueEventType.Open]: 'list',
  [IssueEventType.Close]: 'check'
}

const IssueEventTypeLabelMap = {
  [IssueEventType.Comment]: _TRANSLATE('comment'),
  [IssueEventType.FormResponseRevision]: _TRANSLATE('revision'),
  [IssueEventType.FormResponseMerge]: _TRANSLATE('proposed changes merged'),
  [IssueEventType.Open]: _TRANSLATE('opened'),
  [IssueEventType.Close]: _TRANSLATE('closed')
}

interface EventInfo {
  id:string
  icon:string
  label:string
  primary:string
  secondary:string
  date:string
  userName:string
  type:IssueEventType
}

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css']
})
export class IssueComponent implements OnInit {

  eventInfos:Array<EventInfo> = []
  issue:Issue
  numberOfChanges:number
  canMergeFormResponse = false
  isOpen = false

  @ViewChild('commentForm', {static: false}) commentForm:ElementRef
  @ViewChild('proposedFormResponseContainer', {static: false}) proposedFormResponseContainer:TangyFormsPlayerComponent
  @ViewChild('currentFormResponseContainer', {static: false}) currentFormResponseContainer:TangyFormsPlayerComponent

  tab = 'activity'
  ready = false

  constructor(
    private caseService:CaseService,
    private userService:UserService,
    private route:ActivatedRoute
  ) { }

  ngOnInit() {

    this.route.params.subscribe(async params => {
      window['caseService'] = this.caseService
      this.issue = await this.caseService.getIssue(params.issueId)
      this.numberOfChanges = this.issue.events.reduce((numberOfChanges, event) => {
        return event.type === IssueEventType.FormResponseRevision
          ? numberOfChanges + 1
          : numberOfChanges
      }, 0)
      await this.caseService.load(this.issue.caseId)
      this.update()
      
      this.ready = true
    })
  }

  async update() {
    this.isOpen = this.issue.status === IssueStatus.Open ? true : false
    this.canMergeFormResponse = await this.caseService.canMergeProposedFormResponse(this.issue._id)
    this.eventInfos = this.issue.events.map(event => {
      return <EventInfo>{
        id: event.id,
        icon: IssueEventTypeIconMap[event.type],
        label: IssueEventTypeLabelMap[event.type],
        date: moment(event.date).format('dddd MMMM D, YYYY hh:mma'),
        type: event.type,
        userName: event.userName,
        primary: `
          ${event.data && event.data.comment ? event.data.comment : ``}
        `
      }
    })
    this.proposedFormResponseContainer.response = await this.caseService.getProposedFormResponse(this.issue._id)
    this.proposedFormResponseContainer.render()
    const currentFormResponse = await this.caseService.getFormResponse(this.issue.formResponseId)
    this.currentFormResponseContainer.response = currentFormResponse
    this.currentFormResponseContainer.render()
  }

  async onCommentFormSubmit() {
    const userId = await this.userService.getCurrentUser()
    // @TODO Look up the user's name.
    const userName = userId
    await this.caseService.commentOnIssue(this.issue._id, this.commentForm.nativeElement.value, userId, userName)
    this.commentForm.nativeElement.value = ''
    this.issue = await this.caseService.getIssue(this.issue._id)
    this.update()
  }

  async onMergeClick() {
    const userId = await this.userService.getCurrentUser()
    // @TODO Look up the user's name.
    const userName = userId
    await this.caseService.mergeProposedFormResponse(this.issue._id, userId, userName)
    this.issue = await this.caseService.getIssue(this.issue._id)
    this.update()
  }

  async onOpenClick() {
    const userId = await this.userService.getCurrentUser()
    // @TODO Look up the user's name.
    const userName = userId
    await this.caseService.openIssue(this.issue._id, this.commentForm.nativeElement.value, userId, userName)
    this.commentForm.nativeElement.value = ''
    this.issue = await this.caseService.getIssue(this.issue._id)
    this.update()
  }

  async onCloseClick() {
    const userId = await this.userService.getCurrentUser()
    // @TODO Look up the user's name.
    const userName = userId
    await this.caseService.closeIssue(this.issue._id, this.commentForm.nativeElement.value, userId, userName)
    this.commentForm.nativeElement.value = ''
    this.issue = await this.caseService.getIssue(this.issue._id)
    this.update()
  }

}
