import { Component, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseService } from '../../services/case.service'
import { WindowRef } from '../../../shared/_services/window-ref.service';
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import moment from 'moment/src/moment';
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
  private templateTitle = ''
  private templateDescription = ''
  private caseEventsInfo:Array<CaseEventInfo>
  private creatableCaseEventsInfo:Array<CaseEventInfo>
  private selectedNewEventType = ''
  private inputSelectedDate = moment().format('YYYY-MM-DD')

  constructor(
    private route: ActivatedRoute,
    private windowRef: WindowRef,
    private caseService: CaseService
  ) { }

  async ngAfterContentInit() {
    this.route.params.subscribe(async params => {
      await this.caseService.load(params.id)
      this.windowRef.nativeWindow.caseService = this.caseService
      this.calculateTemplateData()
      this.ready = true
    })
  }

  calculateTemplateData() {
    const caseService = this.caseService
    eval(`this.templateTitle = caseService.caseDefinition.templateTitle ? \`${caseService.caseDefinition.templateTitle}\` : ''`)
    eval(`this.templateDescription = caseService.caseDefinition.templateDescription ? \`${caseService.caseDefinition.templateDescription}\` : ''`)
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
  }

  async onSubmit() {
    const newDate = moment(this.inputSelectedDate, 'YYYY-MM-DD').unix()*1000
    const caseEvent = this.caseService.createEvent(this.selectedNewEventType)
    await this.caseService.scheduleEvent(caseEvent.id, newDate, newDate)
    await this.caseService.save()
    this.calculateTemplateData()
  }

}
