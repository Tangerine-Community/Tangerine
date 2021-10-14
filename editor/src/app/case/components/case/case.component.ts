import { Component, AfterContentInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseService } from '../../services/case.service'
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import * as moment from 'moment';
import { CaseEvent } from '../../classes/case-event.class';
import {Issue} from "../../classes/issue.class";
import {GroupIssuesService} from "../../../groups/services/group-issues.service";
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { AuthenticationService } from 'src/app/core/auth/_services/authentication.service';
import {ProcessMonitorService} from "../../../shared/_services/process-monitor.service";

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
  authenticationService: AuthenticationService
  issues:Array<Issue>
  moment
  groupId:string
  process: any;

  constructor(
    private route: ActivatedRoute,
    caseService: CaseService,
    private router: Router,
    private ref: ChangeDetectorRef,
    authenticationService: AuthenticationService,
    private groupIssuesService:GroupIssuesService,
    private processMonitorService: ProcessMonitorService
  ) {
    ref.detach()
    this.window = window
    this.caseService = caseService
    this.authenticationService = authenticationService
    this.moment = moment
  }

  async ngAfterContentInit() {
    this.groupId = window.location.pathname.split('/')[2]
    const caseId = window.location.hash.split('/')[2]
    if (!this.caseService.case || caseId !== this.caseService.case._id) {
      await this.caseService.load(caseId)
      this.caseService.openCaseConfirmed = false
    }
    this.caseService.setContext()
    this.window.caseService = this.caseService
    this.onCaseOpen()
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

  async archive() {
    const confirmation = confirm(_TRANSLATE('Are you sure you want to archive this case?'))
    if (confirmation) {
      this.process = this.processMonitorService.start('archiving a case', 'Archiving a case.')
      await this.caseService.archive()
      this.processMonitorService.stop(this.process.id)
      this.ref.detectChanges()
    }
  }

  async unarchive() {
    const confirmation = confirm(_TRANSLATE('Are you sure you want to unarchive this case?'))
    if (confirmation) {
      this.process = this.processMonitorService.start('unarchiving a case', 'Un-archiving a case.')
      await this.caseService.unarchive()
      this.processMonitorService.stop(this.process.id)
      this.ref.detectChanges()
    }
  }

  async delete() {
    const confirmDelete = confirm(
      _TRANSLATE('Are you sure you want to delete this case? You will not be able to undo the operation')
    );
    if (confirmDelete) {
      this.process = this.processMonitorService.start('deleting a case', 'Deleting a case.')
      await this.caseService.delete()
      this.processMonitorService.stop(this.process.id)
      this.router.navigate(['groups', window.location.pathname.split('/')[2], 'data', 'cases']) 
    }
  }

}
