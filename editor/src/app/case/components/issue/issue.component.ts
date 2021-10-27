import { TangyFormService } from 'src/app/tangy-forms/tangy-form.service';
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
import { Marked } from '@ts-stack/markdown';
import {Conflict} from "../../classes/conflict.class";
import { conflictTemplate } from './conflict-template';
import { diffString, diff } from 'json-diff';
import {Breadcrumb} from "../../../shared/_components/breadcrumb/breadcrumb.component";
import { ProcessMonitorService } from 'src/app/shared/_services/process-monitor.service';

const IssueEventTypeIconMap = {
  [IssueEventType.Comment]: 'comment',
  [IssueEventType.ProposedChange]: 'call_split',
  [IssueEventType.UpdateMeta]: 'settings',
  [IssueEventType.Merge]: 'call_merge',
  [IssueEventType.Open]: 'playlist_add',
  [IssueEventType.Rebase]: 'settings_backup_restore'
}

const IssueEventTypeLabelMap = {
  [IssueEventType.Comment]: _TRANSLATE('comment'),
  [IssueEventType.UpdateMeta]: _TRANSLATE('updated settings'),
  [IssueEventType.ProposedChange]: _TRANSLATE('revision'),
  [IssueEventType.Merge]: _TRANSLATE('proposed changes merged'),
  [IssueEventType.Open]: _TRANSLATE('opened'),
  [IssueEventType.Close]: _TRANSLATE('closed'),
  [IssueEventType.Rebase]: _TRANSLATE('issue rebased on updated response')
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
  private conflict: Conflict;
  conflictMarkup:string
  private diffOutput: any;
  private merged: any;
  mergedMarkup: string;
  diffMergedMarkup: string;
  breadcrumbs:Array<Breadcrumb> = []
  title = 'Issue'
  constructor(
    private caseService:CaseService,
    private userService:UserService,
    private tangyFormService:TangyFormService,
    private route:ActivatedRoute,
    private pm: ProcessMonitorService
  ) { }

  ngOnInit() {
    let openIssueProcess = this.pm.start('issue-opening', "Opening issue...")
    this.route.params.subscribe(async params => {
      window['caseService'] = this.caseService
      this.issue = await this.caseService.getIssue(params.issueId)
      this.title = this.issue.label
      this.breadcrumbs = [
        <Breadcrumb>{
          label: _TRANSLATE('Issues'),
          url: 'issues'
        },
        <Breadcrumb>{
          label: _TRANSLATE(this.title),
          url: `issues/${this.issue._id}`
        }
      ]
      await this.caseService.load(this.issue.caseId)
      await this.update()
      this.ready = true
      this.pm.stop(openIssueProcess.id)
    })
  }

  async update() {
    this.isOpen = this.issue.status === IssueStatus.Open ? true : false
    this.eventInfos = this.issue.events.map(event => {
      return <EventInfo>{
        id: event.id,
        icon: IssueEventTypeIconMap[event.type],
        label: IssueEventTypeLabelMap[event.type],
        date: moment(event.date).format('dddd MMMM D, YYYY hh:mma'),
        type: event.type,
        userName: event.userName,
        primary: `
          <style>
            /* We cannot put this CSS in issue.component.css because Angular will remove it because nothing in the template uses it. */
            .issue-event h1, .issue-event h2, .issue-event h3, .issue-event h4, .issue-event h5 {
              margin: 15px 0px 5px;
            }
          </style>
          ${event.type === IssueEventType.UpdateMeta ? `
            <h3>Label</h3>
            ${Marked.parse(event.data.label)}
            <h3>Description</h3>
            ${Marked.parse(event.data.description)}
            <h3>Send to Devices</h3>
            ${!event.data.sendToAllDevices && !event.data.sendToDeviceById ? `Do not send to devices.` : ''}
            ${event.data.sendToAllDevices ? `Send to all devices.` : ''}
            ${event.data.sendToDeviceById ? `Send to Device by ID: ${event.data.sendToDeviceById}` : ''}
          `: ``}
        ${event.data && event.data.comment ? Marked.parse(event.data.comment) : ``}
         ${event.data && event.data.diff ? diffTemplate(event.data.diff) : ``}
        `
      }
    })
    // Determine Issue Type to enter different Issue Modes.
    // Sniff the issue to see if it an Issue of type Event Form or an Issue of type Database Conflict.
    // Conflicts that don't have diffInfo have a proposed change already - automerge does not handle formResponses.
    // @TODO There is more work to be done here so that we can cleanly detect what type of issue we have.
    if (this.issue.events[0] && this.issue.events[0]['data'] && this.issue.events[0]['data'].conflict && this.issue.events[0]['data'].conflict.diffInfo) {
      await this.showConflictResolutionOptions()
    } else {
      await this.showProposedChange();
    }
  }

  private async showProposedChange() {
    this.canMergeProposedChange = await this.caseService.canMergeProposedChange(this.issue._id)
    this.hasProposedChange = await this.caseService.hasProposedChange(this.issue._id)
    const proposedChange = await this.caseService.getProposedChange(this.issue._id)
    this.proposedFormResponseContainer.response = proposedChange.response
    this.proposedFormResponseContainer.render()
    let currentFormResponse;
    if (this.issue.events[0].data && this.issue.events[0].data.conflict) {
      currentFormResponse = await this.tangyFormService.getResponse(this.issue.caseId)
    } else {
      currentFormResponse = await this.tangyFormService.getResponse(this.issue.formResponseId)
    }
    this.currentFormResponseContainer.response = currentFormResponse
    this.currentFormResponseContainer.render()
    this.diff = await this.caseService.issueDiff(this.issue._id)
    this.diffMarkup = this.hasProposedChange
      ? diffTemplate(this.diff)
      : ''
    const baseEvent = [...this.issue.events].reverse().find(event => event.type === IssueEventType.Open || event.type === IssueEventType.Rebase)
    const indexOfBaseEvent = this.issue.events.findIndex(event => event.id === baseEvent.id)
    this.numberOfRevisions = this.issue.events.reduce((numberOfChanges, event, i) => {
      return event.type === IssueEventType.ProposedChange && i > indexOfBaseEvent
        ? numberOfChanges + 1
        : numberOfChanges
    }, 0)
    this.numberOfChanges = this.hasProposedChange
      ? this.diff.length
      : 0
  }

  private async showConflictResolutionOptions() {
    this.conflict = this.issue.events.length > 0 ? this.issue.events[0].data.conflict : null
    if (this.conflict) {
      let a, b,merged
      if (this.conflict.merged) {
         a = this.conflict.mergeInfo.diffInfo.a
         b = this.conflict.mergeInfo.diffInfo.b
         merged = this.conflict.mergeInfo.merged
      } else {
        a = this.conflict.diffInfo.a
        b = this.conflict.diffInfo.b
      }
      const output = diff(a, b)
      let diffArray = []
      Object.keys(output).forEach(function (diff) {
        let value = output[diff]
        let newValue = value.__new
        let oldValue = value.__old
        let diffObject = {
          name: diff,
          newValue: newValue,
          oldValue: oldValue,
          value: value
        }
        diffArray.push(diffObject)
      });
      this.diffOutput = diffArray
      this.conflictMarkup = conflictTemplate(this.diffOutput, false)
      let mergedClone;
      if (merged) {
        mergedClone = JSON.parse(JSON.stringify(merged))
      } else {
        // If not merged, use the winner, a.
        mergedClone = JSON.parse(JSON.stringify(a))
      }
      // remove some noise
      delete mergedClone.form
      let diffMergedArray = []
      Object.keys(output).forEach(function (prop) {
        let value = mergedClone[prop]
        let diffObject = {
          name: prop,
          value: value
        }
        diffMergedArray.push(diffObject)
      });
      let mergedArray = []
      Object.keys(mergedClone).forEach(function (prop) {
        let value = mergedClone[prop]
        let diffObject = {
          name: prop,
          value: value
        }
        mergedArray.push(diffObject)
      });
      this.merged = mergedArray
      this.diffMergedMarkup = conflictTemplate(diffMergedArray, true)
      this.mergedMarkup = conflictTemplate(mergedArray, true)

    }

  }

  async onCommentFormSubmit() {
    const process = this.pm.start('commentSubmitting', _TRANSLATE('Submitting comment...'))
    const userId = await this.userService.getCurrentUser()
    // @TODO Look up the user's name.
    const userName = userId
    await this.caseService.commentOnIssue(this.issue._id, this.commentForm.nativeElement.value, userId, userName)
    this.commentForm.nativeElement.value = ''
    this.issue = await this.caseService.getIssue(this.issue._id)
    this.update()
    this.pm.stop(process.id)
  }

  async onMergeClick() {
    const process = this.pm.start('mergeSaving', _TRANSLATE('Saving merge...'))
    const userId = await this.userService.getCurrentUser()
    // @TODO Look up the user's name.
    const userName = userId
    await this.caseService.mergeProposedChange(this.issue._id, userId, userName)
    this.issue = await this.caseService.getIssue(this.issue._id)
    this.update()
    this.pm.stop(process.id)
  }

  async onRebaseClick() {
    const process = this.pm.start('rebasingIssue', _TRANSLATE('Rebasing issue...'))
    const userId = await this.userService.getCurrentUser()
    // @TODO Look up the user's name.
    const userName = userId
    await this.caseService.rebaseIssue(this.issue._id, userId, userName)
    this.issue = await this.caseService.getIssue(this.issue._id)
    this.update()
    this.pm.stop(process.id)
  }

  async onOpenClick() {
    const process = this.pm.start('openingIssue', _TRANSLATE('Opening issue...'))
    const userId = await this.userService.getCurrentUser()
    // @TODO Look up the user's name.
    const userName = userId
    await this.caseService.openIssue(this.issue._id, this.commentForm.nativeElement.value, userId, userName)
    this.commentForm.nativeElement.value = ''
    this.issue = await this.caseService.getIssue(this.issue._id)
    this.update()
    this.pm.stop(process.id)
  }

  async onCloseClick() {
    const process = this.pm.start('closingIssue', _TRANSLATE('Closing issue...'))
    const userId = await this.userService.getCurrentUser()
    // @TODO Look up the user's name.
    const userName = userId
    await this.caseService.closeIssue(this.issue._id, this.commentForm.nativeElement.value, userId, userName)
    this.commentForm.nativeElement.value = ''
    this.issue = await this.caseService.getIssue(this.issue._id)
    this.update()
    this.pm.stop(process.id)
  }

}
