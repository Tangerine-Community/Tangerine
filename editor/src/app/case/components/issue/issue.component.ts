import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model.js';
import { TangyFormsPlayerComponent } from './../../../tangy-forms/tangy-forms-player/tangy-forms-player.component';
import { UserService } from './../../../core/auth/_services/user.service';
import { CommonModule } from '@angular/common';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { IssueEventType } from './../../classes/issue.class';
import { Issue } from '../../classes/issue.class';
import { Router, ActivatedRoute } from '@angular/router';
import { CasesService } from './../../services/cases.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CaseService } from '../../services/case.service';
import { Route } from '@angular/compiler/src/core';

const IssueEventTypeIconMap = {
  [IssueEventType.Comment]: 'comment',
  [IssueEventType.FormResponseRevision]: 'call_split',
  [IssueEventType.FormResponseMerge]: 'call_merge'
}

const IssueEventTypeLabelMap = {
  [IssueEventType.Comment]: _TRANSLATE('comment'),
  [IssueEventType.FormResponseRevision]: _TRANSLATE('revision'),
  [IssueEventType.FormResponseMerge]: _TRANSLATE('merge')
}

interface EventInfo {
  id:string
  icon:string
  label:string
  primary:string
  secondary:string
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
    this.eventInfos = this.issue.events.map(event => {
      return <EventInfo>{
        id: event.id,
        icon: IssueEventTypeIconMap[event.type],
        label: IssueEventTypeLabelMap[event.type],
        type: event.type,
        userName: event.userName,
        primary: `
          ${event.type === IssueEventType.Comment ? event.data.comment : ``}
        `
      }
    })
    const proposedFormResponse = <TangyFormResponseModel>this.issue.events.reduce((lastProposedFormResponse, event) => event.type === IssueEventType.FormResponseRevision ? event.data.response : lastProposedFormResponse, {})
    this.proposedFormResponseContainer.response = proposedFormResponse
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

}
