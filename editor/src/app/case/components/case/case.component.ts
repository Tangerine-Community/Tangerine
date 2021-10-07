import { Component, AfterContentInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseService } from '../../services/case.service'
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import * as moment from 'moment';
import { CaseEvent } from '../../classes/case-event.class';
import {Issue} from "../../classes/issue.class";
import {GroupIssuesService} from "../../../groups/services/group-issues.service";
import axios from "axios";
import {_TRANSLATE} from "../../../../../../client/src/app/shared/translation-marker";

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
  conflicts:Array<any>
  moment
  groupId:string
  hideRestore: boolean = false

  constructor(
    private route: ActivatedRoute,
    caseService: CaseService,
    private ref: ChangeDetectorRef,
    private groupIssuesService:GroupIssuesService,
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
      // const conflictRevisionIds = conflictsQueryResults.map(currentDoc => currentDoc._conflicts)
      let conflictRevisionIds = conflictsQueryResults.reduce(function(previousValue, currentValue) {
        return [...previousValue, ...currentValue._conflicts]
      }, [])
      const conflicts = []
      if (conflictRevisionIds) {
        for (const conflictRevisionId of conflictRevisionIds) {
          const token = localStorage.getItem('token');
          const conflictRevisionDoc = (<any>await axios.get(`/group-responses/readRev/${this.groupId}/${caseId}/${conflictRevisionId}`, { headers: { authorization: token }})).data
          conflicts.push(conflictRevisionDoc)
        }
      }
      const caseParticipantIds = this.caseService.case.participants.map(participant => participant.id)
      this.conflicts = []
      const allConflictEventIds = []
      conflicts.forEach(conflict => {
        const conflictEvents = conflict.events.map(event => {
          allConflictEventIds.push(event.id)
          if (event.eventForms) {
            const hasParticipant = (eventForm) => {
              return caseParticipantIds.includes(eventForm.participantId)
            }
            const relevantEvent = event.eventForms.some(hasParticipant)
            if (relevantEvent) {
              return event
            }
          }
        })
        // const conflictIds = conflictEvents.map(event => event.id)
        const caseEventIds = this.caseService.case.events.map(event => event.id)
        // const conflictFormResponses = []
        conflictEvents.forEach(event => {
          const isOldEvent = caseEventIds.includes(event.id)
          if (!isOldEvent) {
            event.conflictRevisionId = conflict._rev
            this.conflicts.push(event)
          }
          // if (event.eventForms) {
          //   event.eventForms.forEach(eventForm => {
          //     if (eventForm.formResponseId) {
          //       conflictFormResponses.push(eventForm)
          //     }
          //   })
          // }
        })
        
    })
    } catch (e) {
      console.error("Error fetching conflicts: " + JSON.stringify(e))
    }
    this.calculateTemplateData()
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
      }
    }
  }

}
