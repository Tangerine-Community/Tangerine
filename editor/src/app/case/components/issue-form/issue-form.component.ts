import { UserService } from './../../../core/auth/_services/user.service';
import { Issue } from '../../classes/issue.class';
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
      await this.caseService.load(this.issue.caseId)
      this.window.caseService = this.caseService
      this.caseEvent = this
        .caseService
        .case
        .events
        .find(caseEvent => caseEvent.id === this.issue.eventId)
      this.caseEventDefinition = this
        .caseService
        .caseDefinition
        .eventDefinitions
        .find(caseDef => caseDef.id === this.caseEvent.caseEventDefinitionId)
      this.eventForm = this.caseEvent.eventForms.find(eventForm => eventForm.id === this.issue.eventFormId)
      this.eventFormDefinition = this
        .caseEventDefinition
        .eventFormDefinitions
        .find(eventFormDefinition => eventFormDefinition.id === this.eventForm.eventFormDefinitionId)
      this.formId = this.eventFormDefinition.formId

      if (params.eventId) {
        // We're viewing a specific form revision.
        let formResponseRevision = this.issue.events.find(event => event.id === params.eventId).data.response
        this.formResponseId = formResponseRevision._id
        this.formPlayer.response = formResponseRevision 
      }
      else if (await this.caseService.canMergeProposedFormResponse(this.issue._id)) {
        // Create a revision based on the last proposed revision.
        let proposedFormResponse = await this.caseService.getProposedFormResponse(this.issue._id)
        this.formResponseId = proposedFormResponse._id
        this.formPlayer.response = proposedFormResponse
      } else {
        // Create a revision based on the current form response because we can't merge the last proposed revision.
        let formResponse = await this.caseService.getFormResponse(this.issue.formResponseId)
        this.formResponseId = formResponse._id
        this.formPlayer.response = formResponse
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

          await this.caseService.saveFormResponseRevision(this.formPlayer.formEl.response, this.issue._id, userId, userName)
          this.router.navigate([`../`], { relativeTo: this.route })
        }, 500)
      })
      this.loaded = true
    })
  }

}
