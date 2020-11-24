import { UserService } from 'src/app/shared/_services/user.service';
import { Issue, IssueEventType } from '../../classes/issue.class';
import { TangyFormsPlayerComponent } from './../../../tangy-forms/tangy-forms-player/tangy-forms-player.component';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { Component, OnInit, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseService } from '../../services/case.service'
import { EventForm } from '../../classes/event-form.class';
import { CaseEvent } from '../../classes/case-event.class';
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import { EventFormDefinition } from '../../classes/event-form-definition.class';

@Component({
  selector: 'app-issue-form',
  templateUrl: './issue-form.component.html',
  styleUrls: ['./issue-form.component.css']
})
export class IssueFormComponent implements OnInit {

  issue:Issue
  caseEvent: CaseEvent
  caseEventDefinition: CaseEventDefinition
  eventFormDefinition: EventFormDefinition
  eventForm: EventForm
  formInfo: FormInfo
  formId:string
  templateId:string
  formResponseId:string

  loaded = false

  window:any

  @ViewChild('container', {static: true}) container: ElementRef;
  @ViewChild('menu', {static: true}) menu: ElementRef;
  @ViewChild('formPlayer', {static: true}) formPlayer: TangyFormsPlayerComponent

  constructor(
    private route: ActivatedRoute,
    private hostElementRef: ElementRef,
    private router: Router,
    private userService:UserService,
    private caseService: CaseService,
  ) {
    this.window = window
  }

  async ngOnInit() {
    setTimeout(() => this.hostElementRef.nativeElement.classList.add('hide-spinner'), 3000)
    this.route.params.subscribe(async params => {
      window['caseService'] = this.caseService
      this.issue = await this.caseService.getIssue(params.issueId)
      this.window.caseService = this.caseService
      this.window.isRevision = true
      let caseInstance:any
      if (params.eventId) {
        // We're viewing a specific form revision, not making a revision.
        let formResponseRevision = this.issue.events.find(event => event.id === params.eventId).data.response
        caseInstance = this.issue.events.find(event => event.id === params.eventId).data.caseInstance
        await this.caseService.loadInMemory(caseInstance)
        this.caseService.setContext(this.issue.eventId, this.issue.eventFormId)
        this.formResponseId = formResponseRevision._id
        this.formPlayer.response = formResponseRevision
      }
      else if (await this.caseService.hasProposedChange(this.issue._id)) {
        // Create a revision based on the last proposed revision.
        const proposedRevisionEvent = await this.caseService.getProposedChange(this.issue._id)
        let proposedFormResponse = proposedRevisionEvent.response
        await this.caseService.loadInMemory(proposedRevisionEvent.caseInstance)
        this.caseService.setContext(this.issue.eventId, this.issue.eventFormId)
        this.formPlayer.response = proposedFormResponse
      } else {
        // Create a revision based on the base event.
        const baseEvent = [...this.issue.events].reverse().find(event => event.type === IssueEventType.Open || event.type === IssueEventType.Rebase)
        await this.caseService.loadInMemory(baseEvent.data.caseInstance)
        this.caseService.setContext(this.issue.eventId, this.issue.eventFormId)
        this.formPlayer.response = baseEvent.data.response
      }
      this.formPlayer.render()

      // After render of the player, it will have created a new form response if one was not assigned.
      // Make sure to save that new form response ID into the EventForm.
      this.formPlayer.$rendered.subscribe(async () => {
        if (!params.eventId) this.formPlayer.unlock()
      })
      this.formPlayer.$submit.subscribe(async () => {
        setTimeout(async () => {
          const userId = await this.userService.getCurrentUser()
          // @TODO Look up the user's name.
          const userName = userId

          await this.caseService.saveProposedChange(this.formPlayer.formEl.response, this.caseService.case, this.issue._id, userId, userName)
          this.router.navigate([`../`], { relativeTo: this.route })
        }, 500)
      })
      this.loaded = true
    })
  }

}
