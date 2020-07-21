import { Component, OnInit, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CaseService } from '../../services/case.service'
import { CaseDefinitionsService } from '../../services/case-definitions.service'
import { EventForm } from '../../classes/event-form.class';

@Component({
  selector: 'app-new-case',
  templateUrl: './new-case.component.html',
  styleUrls: ['./new-case.component.css']
})
export class NewCaseComponent implements AfterContentInit {

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private caseService:CaseService,
    private caseDefinitionsService:CaseDefinitionsService,
  ) { }

  async ngAfterContentInit() {
    this.activatedRoute.queryParams.subscribe(async params => {
      const formId = params['formId'];
      const caseDefinitions = await this.caseDefinitionsService.load();
      await this.caseService.create(caseDefinitions.find(caseDefinition => caseDefinition.formId === formId).id)
      this.caseService.openCaseConfirmed = true
      let eventForm:EventForm
      if (this.caseService.caseDefinition.startFormOnOpen && this.caseService.caseDefinition.startFormOnOpen.eventFormId) {
        const caseEvent = this.caseService.createEvent(this.caseService.caseDefinition.startFormOnOpen.eventId)
        eventForm = caseEvent.eventForms.find(eventForm => eventForm.eventFormDefinitionId === this.caseService.caseDefinition.startFormOnOpen.eventFormId)
        if (!eventForm){
          eventForm = this.caseService.createEventForm(caseEvent.id, this.caseService.caseDefinition.startFormOnOpen.eventFormId) 
        }
        await this.caseService.save()
        this.router.navigate(['case', 'event', 'form', eventForm.caseId, eventForm.caseEventId, eventForm.id])
      } else {
        this.router.navigate(['case', this.caseService.case._id])
      }
    })
  }
 
}
