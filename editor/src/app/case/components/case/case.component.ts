import {Component, AfterContentInit, ChangeDetectorRef, OnDestroy, ViewChild, Input} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseService } from '../../services/case.service'
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import * as moment from 'moment';
import { CaseEvent } from '../../classes/case-event.class';
import {Issue} from "../../classes/issue.class";
import {GroupIssuesService} from "../../../groups/services/group-issues.service";
import axios from "axios";
import {_TRANSLATE} from "../../../../../../client/src/app/shared/translation-marker";
import {TangyFormService} from "../../../tangy-forms/tangy-form.service";
import {TangyFormsPlayerComponent} from "../../../tangy-forms/tangy-forms-player/tangy-forms-player.component";
import {TangyFormResponseModel} from "tangy-form/tangy-form-response-model";

class CaseEventInfo {
  caseEvents:Array<CaseEvent>;
  caseEventDefinition:CaseEventDefinition;
}

@Component({
  selector: 'app-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.css']
})
export class CaseComponent implements AfterContentInit, OnDestroy {

  private ready = false
  templateTitle = ''
  templateDescription = ''
  caseEventsInfo:Array<CaseEventInfo>
  creatableCaseEventsInfo:Array<CaseEventInfo>
  selectedNewEventType = ''
  private inputSelectedDate = moment().format('YYYY-MM-DD')
  window:any
  caseService: CaseService
  issues:Array<Issue>
  conflictingEvents:Array<any>
  moment
  groupId:string
  hideRestore: boolean = false
  // @ViewChild('formPlayer', {static: true}) formPlayer: TangyFormsPlayerComponent
  @ViewChild('proposedFormResponseContainer', {static: false}) proposedFormResponseContainer:TangyFormsPlayerComponent
  hideFormPlayer = true
  // @Input('response') response:TangyFormResponseModel
  constructor(
    private route: ActivatedRoute,
    caseService: CaseService,
    private ref: ChangeDetectorRef,
    private groupIssuesService:GroupIssuesService,
    private tangyFormService: TangyFormService
  ) {
    ref.detach()
    this.window = window
    this.caseService = caseService
    this.moment = moment
  }

  async ngAfterContentInit() {
    const caseId = window.location.hash.split('/')[2]
    this.groupId = window.location.pathname.split('/')[2]
    if (!this.caseService.case || caseId !== this.caseService.case._id) {
      await this.caseService.load(caseId)
      this.caseService.openCaseConfirmed = false
    }
    this.caseService.setContext()
    this.window.caseService = this.caseService
    this.onCaseOpen()
    this.calculateTemplateData()
    await this.getIssuesAndConflicts(caseId)
    this.ready = true
  }

  calculateTemplateData() {
    const caseService = this.caseService
    const getVariable = (variableName) => {
      const variablesByName = caseService.case.items.reduce((variablesByName,item) => {
        for (let input of item.inputs) {
          variablesByName[input.name] = input.value
        }
        return variablesByName
      }, {})
      return variablesByName[variableName]
    }
    eval(`this.templateTitle = caseService.caseDefinition.templateCaseTitle ? \`${caseService.caseDefinition.templateCaseTitle}\` : ''`)
    eval(`this.templateDescription = caseService.caseDefinition.templateCaseDescription ? \`${caseService.caseDefinition.templateCaseDescription}\` : ''`)
    this.caseEventsInfo = this
      .caseService
      .caseDefinition
      .eventDefinitions
      .map(caseEventDefinition => {
        return {
          caseEventDefinition,
          caseEvents: this.caseService.case.events.filter(caseEvent => caseEvent.caseEventDefinitionId === caseEventDefinition.id)
        }
      })
    this.creatableCaseEventsInfo = this.caseEventsInfo
      .filter(caseEventInfo => {
        return (caseEventInfo.caseEventDefinition.repeatable === true || caseEventInfo.caseEvents.length === 0)
          && undefined === this.caseService.case.disabledEventDefinitionIds.find(eventDefinitionId => eventDefinitionId === caseEventInfo.caseEventDefinition.id)
      })
    this.selectedNewEventType = ''
    this.inputSelectedDate = moment(new Date()).format('YYYY-MM-DD')
    this.ref.detectChanges()
  }
  
  async getIssuesAndConflicts(caseId) {
    try {
      const queryResults = await this.groupIssuesService.query(this.groupId, {
        fun: "issuesByCaseId",
        keys: [caseId],
        include_docs: true,
        descending: true
      })
      this.issues = queryResults.map(issue => issue.doc)
    } catch (e) {
      console.error("Error fetching issues: " + JSON.stringify(e))
    }
    try {
      const queryResults = await this.groupIssuesService.query(this.groupId, {
        fun: "conflicts",
        keys: [caseId],
        conflicts: true,
        include_docs: true,
        descending: true
      })
      const conflictsQueryResults = queryResults.map(conflicts => conflicts.doc)
      let conflictRevisionIds = conflictsQueryResults.reduce(function (previousValue, currentValue) {
        return [...previousValue, ...currentValue._conflicts]
      }, [])
      const conflicts = []
      if (conflictRevisionIds) {
        for (const conflictRevisionId of conflictRevisionIds) {
          const token = localStorage.getItem('token');
          const conflictRevisionDoc = (<any>await axios.get(`/group-responses/readRev/${this.groupId}/${caseId}/${conflictRevisionId}`, {headers: {authorization: token}})).data
          conflicts.push(conflictRevisionDoc)
        }
      }
      const caseParticipantIds = this.caseService.case.participants.map(participant => participant.id)
      this.conflictingEvents = []
      conflicts.forEach(conflict => {
        const caseEventIds = this.caseService.case.events.map(event => event.id)
        // filter out any events that are from participants not in this "winning" case rev
        const conflictEvents = conflict.events.map(event => {
          if (event.eventForms) {
            const hasParticipant = (eventForm) => {
              // The first Registration event's participantId is empty.
              if (eventForm.participantId === "") {
                return true
              } else {
                return caseParticipantIds.includes(eventForm.participantId)
              }
            }
            const relevantEvent = event.eventForms.some(hasParticipant)
            if (relevantEvent) {
              return event
            }
          }
        })
        // Now find any events that are not in the "winning" rev.
        conflictEvents.forEach(event => {
          const isOldEvent = caseEventIds.includes(event.id)
          if (!isOldEvent) {
            // since we are putting events from different _revs in the same array, need to mark which _rev the event belongs to.
            event.conflictRevisionId = conflict._rev
            this.conflictingEvents.push(event)
          }
        })
      })
    } catch (e) {
      console.error("Error fetching conflicts: " + JSON.stringify(e))
    }
  }

  onOpenCaseConfirmButtonClick() {
    this.caseService.openCaseConfirmed = true
    this.ref.detectChanges()
  }
  onCaseOpen(){
    eval(this.caseService.caseDefinition.onCaseOpen)
  }

  ngOnDestroy(){
    eval(this.caseService.caseDefinition.onCaseClose)
  }
  async onSubmit() {
    const newDate = moment(this.inputSelectedDate, 'YYYY-MM-DD').unix()*1000
    const caseEvent = this.caseService.createEvent(this.selectedNewEventType)
    await this.caseService.save()
    this.calculateTemplateData()
  }
  async onRestore(event) {
    const restoreConfirmed = confirm(_TRANSLATE('Restore this event?'));
    if (restoreConfirmed) {
      if (event.restored) {
        alert("Already restored.")
      } else {
        console.log("Before: this.caseService.case.events length: " + this.caseService.case.events.length)
        this.caseService.case.events.push(event)
        console.log("After: this.caseService.case.events length: " + this.caseService.case.events.length)
        event.restored = Date.now()
        await this.caseService.save()
        let eventFormId
        if (event.eventForms && event.eventForms.length > 0) {
          eventFormId = event.eventForms[0].id
        }
        try {
          await this.caseService.createIssue(`Conflict event merged on ${event.name}`, `conflictRevisionId:${event.conflictRevisionId}`, this.caseService.case._id, event.id, eventFormId, 'EDITOR', 'EDITOR', null)
        } catch (e) {
          console.log("Error: " + JSON.stringify(e))
        }
        // recalc the case structure - this.calculateTemplateData()
        // then this.ref.detectChanges()
        this.calculateTemplateData()
        const caseId = window.location.hash.split('/')[2]
        await this.getIssuesAndConflicts(caseId)
        // calculateTemplateData already does a this.ref.detectChanges(), but just in case...
        this.ref.detectChanges()
      }
    }
  }
  
  async showConflictFormResponse(formResponseId) {
    if (formResponseId) {
      console.log("Displaying formResponseId: " + formResponseId)
      const formResponse = await this.tangyFormService.getResponse(formResponseId)
      // this.formPlayer.formResponseId = formResponse._id
      // this.formPlayer.response = formResponse
      // await this.formPlayer.render()
      this.hideFormPlayer = false
      this.proposedFormResponseContainer.response = formResponse
      await this.proposedFormResponseContainer.render()
      this.scroll(this.proposedFormResponseContainer.container.nativeElement)
    }
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

}
