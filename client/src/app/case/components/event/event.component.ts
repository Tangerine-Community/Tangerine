import { Component, OnInit, AfterContentInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../shared/_services/user.service';
import { CaseService } from '../../services/case.service'
import { CaseEvent } from '../../classes/case-event.class'
import { CaseEventDefinition } from '../../classes/case-event-definition.class';
import { EventForm } from '../../classes/event-form.class';
import { EventFormDefinition } from '../../classes/event-form-definition.class';
import { WindowRef } from 'src/app/core/window-ref.service';

class EventFormInfo {
  eventFormDefinition:EventFormDefinition
  eventForm:EventForm
}

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit, AfterContentInit {

  caseEvent:CaseEvent
  caseEventDefinition: CaseEventDefinition
  eventFormsInfo:Array<EventFormInfo>
  loaded = false
  availableEventFormDefinitions:Array<EventFormDefinition> = []
  selectedNewEventFormDefinition = ''

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseService: CaseService,
    private windowRef: WindowRef,
    private userService: UserService
  ) { }

  ngOnInit() {
  }

  async ngAfterContentInit() {
    this.route.params.subscribe(async params => {
      await this.caseService.load(params.caseId)
      this.windowRef.nativeWindow.caseService = this.caseService
      this.caseEvent = this
        .caseService
        .case
        .events
        .find(caseEvent => caseEvent.id === params.eventId)
      this.caseEventDefinition = this
        .caseService
        .caseDefinition
        .eventDefinitions
        .find(caseDef => caseDef.id === this.caseEvent.caseEventDefinitionId)
      this.eventFormsInfo = this
        .caseEventDefinition
        .eventFormDefinitions
        .reduce((eventFormsInfo, eventFormDefinition) => {
           return [
              ...eventFormsInfo,
              ...this
                .caseEvent
                .eventForms
                .reduce((eventFormsInfoSubset, eventForm) => {
                  return eventForm.eventFormDefinitionId === eventFormDefinition.id
                    ? [
                        ...eventFormsInfoSubset, 
                        <EventFormInfo>{
                          eventFormDefinition,
                          eventForm
                        }
                      ]
                    : eventFormsInfoSubset
                }, [])
           ]
          }, [])
      this.calculateAvailableEventFormDefinitions()
      this.loaded = true
    })
  }

  calculateAvailableEventFormDefinitions() {
    this.availableEventFormDefinitions = this.caseEventDefinition.eventFormDefinitions
      .reduce((availableEventFormDefinitions, eventFormDefinition) => {
        const eventFormDefinitionHasForm = this.caseEvent.eventForms
          .reduce((eventFormDefinitionHasForm, form) => {
            return eventFormDefinitionHasForm || form.eventFormDefinitionId === eventFormDefinition.id
          }, false)
        return eventFormDefinition.repeatable || !eventFormDefinitionHasForm             
          ? [...availableEventFormDefinitions, eventFormDefinition]
          : availableEventFormDefinitions
      }, [])
  }

  onSubmit() {
    if (this.selectedNewEventFormDefinition) {
      this.startEventForm(this.selectedNewEventFormDefinition)
    }
  }

  async startEventForm(eventFormDefinitionId:string) {
    // Make this function...
    const eventForm = this.caseService.startEventForm(this.caseEvent.id, eventFormDefinitionId)
    await this.caseService.save()
    // Then navigate
    this.router.navigate(['case', 'event', 'form', eventForm.caseId, eventForm.caseEventId, eventForm.id])
  }

}