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
import { diffTemplate } from './diff-template';

const IssueEventTypeIconMap = {
  [IssueEventType.Comment]: 'comment',
  [IssueEventType.ProposedChange]: 'call_split',
  [IssueEventType.Merge]: 'call_merge',
  [IssueEventType.Open]: 'playlist_add',
  [IssueEventType.Close]: 'playlist_add_check'
}

const IssueEventTypeLabelMap = {
  [IssueEventType.Comment]: _TRANSLATE('comment'),
  [IssueEventType.ProposedChange]: _TRANSLATE('revision'),
  [IssueEventType.Merge]: _TRANSLATE('proposed changes merged'),
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
  numberOfRevisions:number
  canMergeProposedChange = false
  hasProposedChange = false
  isOpen = false
  diffMarkup:string
  diff:any

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
      this.numberOfRevisions = this.issue.events.reduce((numberOfChanges, event) => {
        return event.type === IssueEventType.ProposedChange
          ? numberOfChanges + 1
          : numberOfChanges
      }, 0)
      this.numberOfChanges = (await this.caseService.issueDiff(this.issue._id)).length
      await this.caseService.load(this.issue.caseId)
      await this.update()
      this.ready = true
    })
  }

  async update() {
    this.isOpen = this.issue.status === IssueStatus.Open ? true : false
    this.canMergeProposedChange = await this.caseService.canMergeProposedChange(this.issue._id)
    this.hasProposedChange = await this.caseService.hasProposedChange(this.issue._id)
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
          ${event.data && event.data.diff ? diffTemplate(event.data.diff) : ``}
        `
      }
    })
    const proposedChange = await this.caseService.getProposedChange(this.issue._id)
    this.proposedFormResponseContainer.response = proposedChange.response 
    this.proposedFormResponseContainer.render()
    const currentFormResponse = await this.caseService.getFormResponse(this.issue.formResponseId)
    this.currentFormResponseContainer.response = currentFormResponse
    this.currentFormResponseContainer.render()
    this.diff = await this.caseService.issueDiff(this.issue._id)
    this.diffMarkup = diffTemplate(this.diff)
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
    await this.caseService.mergeProposedChange(this.issue._id, userId, userName)
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
