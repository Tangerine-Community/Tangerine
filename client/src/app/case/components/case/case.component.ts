import { CaseEventOperation } from './../../classes/case-event-definition.class';
import { UserService } from 'src/app/shared/_services/user.service';
import { Component, AfterContentInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseService } from '../../services/case.service'
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import * as moment from 'moment';
import { CaseEvent } from '../../classes/case-event.class';
import { ProcessMonitorService } from 'src/app/shared/_services/process-monitor.service';
import { _TRANSLATE } from 'src/app/shared/translation-marker';

class CaseEventInfo {
  caseEvents:Array<CaseEvent>;
  caseEventDefinition:CaseEventDefinition;
}

@Component({
  selector: 'app-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.css'],
  providers: [ CaseService ]
})
export class CaseComponent implements AfterContentInit, OnDestroy {

  private ready = false
  userRoles:Array<string>
  templateTitle = ''
  templateDescription = ''
  caseEventsInfo:Array<CaseEventInfo>
  creatableCaseEventsInfo:Array<CaseEventInfo>
  readableCaseEventsInfo:Array<CaseEventInfo>
  unreadableCaseEventsInfo:Array<CaseEventInfo>
  selectedNewEventType = ''
  private inputSelectedDate = moment().format('YYYY-MM-DD')
  window:any
  caseService: CaseService

  constructor(
    private route: ActivatedRoute,
    private userService:UserService,
    caseService: CaseService,
    private processMonitorService:ProcessMonitorService,
    private ref: ChangeDetectorRef
  ) {
    ref.detach()
    this.window = window
    this.caseService = caseService
  }
  async ngAfterContentInit() {
    // take over T.case.
    window["T"].case = this.caseService
    const process = this.processMonitorService.start('caseOpen', _TRANSLATE('Opening Case...'))
    this.userRoles = await this.userService.getRoles()
    const caseId = window.location.hash.split('/')[2]
    // if (!this.caseService.case || caseId !== this.caseService.case._id) {
    await this.caseService.load(caseId)
    this.caseService.openCaseConfirmed = false
    // }
    this.caseService.setContext()
    this.window.caseService = this.caseService
    this.window.T.case = this.caseService
    this.onCaseOpen()
    this.calculateTemplateData()
    this.ready = true
    this.processMonitorService.stop(process.id)
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
    this.readableCaseEventsInfo = this.caseEventsInfo.filter(caseEventInfo => {
      return this.caseService.hasCaseEventPermission(CaseEventOperation.READ, caseEventInfo.caseEventDefinition)
    })
    this.unreadableCaseEventsInfo = this.caseEventsInfo.filter(caseEventInfo => {
      return !this.caseService.hasCaseEventPermission(CaseEventOperation.READ, caseEventInfo.caseEventDefinition)
    })
    this.creatableCaseEventsInfo = this.caseEventsInfo
      .filter(caseEventInfo => {
        return (
          (caseEventInfo.caseEventDefinition.repeatable === true || caseEventInfo.caseEvents.length === 0) &&
          undefined === this.caseService.case.disabledEventDefinitionIds.find(eventDefinitionId => eventDefinitionId === caseEventInfo.caseEventDefinition.id) &&
          this.caseService.hasCaseEventPermission(CaseEventOperation.CREATE, caseEventInfo.caseEventDefinition)
        )
          ? true
          : false
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
    const process = this.processMonitorService.start('savingEvent', _TRANSLATE('Saving event...'))
    if (this.selectedNewEventType !== '') {
      const newDate = moment(this.inputSelectedDate, 'YYYY-MM-DD').unix()*1000
      const caseEvent = this.caseService.createEvent(this.selectedNewEventType)
      await this.caseService.save()
      this.calculateTemplateData()
      this.processMonitorService.stop(process.id)
    }
  }

}
