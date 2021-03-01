import { CaseEventOperation } from './../../classes/case-event-definition.class';
import { UserService } from 'src/app/shared/_services/user.service';
import { Component, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseService } from '../../services/case.service'
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import * as moment from 'moment';
import { CaseEvent } from '../../classes/case-event.class';

class CaseEventInfo {
  caseEvents:Array<CaseEvent>;
  caseEventDefinition:CaseEventDefinition;
}

@Component({
  selector: 'app-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.css']
})
export class CaseComponent implements AfterContentInit {

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
    private ref: ChangeDetectorRef
  ) {
    ref.detach()
    this.window = window
    this.caseService = caseService
  }

  async ngAfterContentInit() {
    this.userRoles = await this.userService.getRoles()
    const caseId = window.location.hash.split('/')[2]
    // if (!this.caseService.case || caseId !== this.caseService.case._id) {
    await this.caseService.load(caseId)
    this.caseService.openCaseConfirmed = false
    // }
    this.caseService.setContext()
    this.window.caseService = this.caseService
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

  async onSubmit() {
    if (this.selectedNewEventType !== '') {
      const newDate = moment(this.inputSelectedDate, 'YYYY-MM-DD').unix()*1000
      const caseEvent = this.caseService.createEvent(this.selectedNewEventType)
      await this.caseService.save()
      this.calculateTemplateData()
    }
  }

}
