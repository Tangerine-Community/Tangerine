import { Component, AfterContentInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseService } from '../../services/case.service'
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import * as moment from 'moment';
import { CaseEvent } from '../../classes/case-event.class';
import {Issue} from "../../classes/issue.class";
import {GroupIssuesService} from "../../../groups/services/group-issues.service";

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
    if (!this.caseService.case || caseId !== this.caseService.case._id) {
      await this.caseService.load(caseId)
      this.caseService.openCaseConfirmed = false
    }
    this.caseService.setContext()
    this.window.caseService = this.caseService
    this.onCaseOpen()
    this.groupId = this.caseService.case['groupId']
    try {
      let queryResults = await this.groupIssuesService.query(this.groupId, {
        fun: "issuesByCaseId",
        keys: [caseId],
        include_docs: true,
        descending: true
      })
      this.issues = queryResults.map(issue => issue.doc)
    } catch (e) {
      console.log("Error fetching issues: " + e)
    }
    try {
      let queryResults = await this.groupIssuesService.query(this.groupId, {
        fun: "conflicts",
        keys: [caseId],
        include_docs: true,
        descending: true
      })
      const conflicts = queryResults.map(conflicts => conflicts.doc)
      const caseParticipantIds = this.caseService.case.participants.map(participant => participant.id)
      conflicts.forEach(conflict => {
        const conflictEvents = conflict.events.map(event => {
          
        })
      })
    } catch (e) {
      console.log("Error fetching conflicts: " + e)
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

}
