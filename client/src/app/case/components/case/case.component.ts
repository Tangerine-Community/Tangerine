import { Component, OnInit, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseService } from '../../services/case.service'
import { WindowRef } from '../../../shared/_services/window-ref.service';
import { TangyFormService } from 'src/app/tangy-forms/tangy-form.service';
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import moment from 'moment/src/moment';

@Component({
  selector: 'app-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.css']
})
export class CaseComponent implements AfterContentInit {

  tangyFormEl:any
  ready = false
  show = 'manifest'
  templateTitle = ''
  templateDescription = ''
  availableEventTypes:Array<CaseEventDefinition> = []
  selectedNewEventType = ''
  inputSelectedDate = moment().format('YYYY-MM-DD')

  constructor(
    private route: ActivatedRoute,
    private windowRef: WindowRef,
    private caseService: CaseService,
    private tangyFormService: TangyFormService,
    private router: Router
  ) { }

  async ngAfterContentInit() {
    this.route.params.subscribe(async params => {
      await this.caseService.load(params.id)
      const caseService = this.caseService
      eval(`this.templateTitle = caseService.caseDefinition.templateTitle ? \`${caseService.caseDefinition.templateTitle}\` : ''`)
      eval(`this.templateDescription = caseService.caseDefinition.templateDescription ? \`${caseService.caseDefinition.templateDescription}\` : ''`)
      this.windowRef.nativeWindow.caseService = this.caseService
      this.calculateAvailableEventTypes()
      this.ready = true
    })
  }

  calculateAvailableEventTypes() {
    this.availableEventTypes = this.caseService.caseDefinition.eventDefinitions
      .reduce((availableEventTypes, eventDefinition) => {
        const eventDefinitionHasEvent = this.caseService.case.events
          .reduce((eventDefinitionHasEvent, event) => {
            return eventDefinitionHasEvent || event.caseEventDefinitionId === eventDefinition.id
          }, false)
        return eventDefinition.repeatable || !eventDefinitionHasEvent             
          ? [...availableEventTypes, eventDefinition]
          : availableEventTypes
      }, [])
  }

  onSubmit() {
    const newDate = moment(this.inputSelectedDate, 'YYYY-MM-DD').unix()*1000
    this.createEvent(this.selectedNewEventType, newDate)
  }

  async createEvent(eventDefinitionId, newDate) {
    const caseEvent = this.caseService.createEvent(eventDefinitionId)
    // @TODO We need a widget on screen to capture start and end datetime for the event.
    await this.caseService.scheduleEvent(caseEvent.id, newDate, newDate)
    await this.caseService.save()
    this.calculateAvailableEventTypes()
  }

  // @TODO Will we use this?
  async createEventAndOpen(eventDefinitionId) {
    const caseEvent = this.caseService.createEvent(eventDefinitionId)
    await this.caseService.save()
    this.router.navigate(['case', 'event', this.caseService.case._id, caseEvent.id])
  }

}
