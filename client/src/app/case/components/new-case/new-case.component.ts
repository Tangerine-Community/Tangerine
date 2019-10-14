import { Component, OnInit, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../../shared/_services/authentication.service';
import { HttpClient } from '@angular/common/http';
import { CaseService } from '../../services/case.service'
import { CaseDefinitionsService } from '../../services/case-definitions.service'
import { WindowRef } from 'src/app/shared/_services/window-ref.service';
import { EventForm } from '../../classes/event-form.class';

@Component({
  selector: 'app-new-case',
  templateUrl: './new-case.component.html',
  styleUrls: ['./new-case.component.css']
})
export class NewCaseComponent implements AfterContentInit {

  constructor(
    private router: Router,
    authenticationService: AuthenticationService,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private caseService:CaseService,
    private caseDefinitionsService:CaseDefinitionsService,
    private windowRef: WindowRef
  ) { }

  async ngAfterContentInit() {
    this.activatedRoute.queryParams.subscribe(async params => {
      const formId = params['formId'];
      const caseDefinitions = await this.caseDefinitionsService.load();
      await this.caseService.create(caseDefinitions.find(caseDefinition => caseDefinition.formId === formId).id)
      let eventForm:EventForm
      if (this.caseService.caseDefinition.startFormOnOpen && this.caseService.caseDefinition.startFormOnOpen.eventFormId) {
        const caseEvent = this.caseService.createEvent(this.caseService.caseDefinition.startFormOnOpen.eventId, true)
        eventForm = caseEvent.eventForms.find(eventForm => eventForm.eventFormDefinitionId === this.caseService.caseDefinition.startFormOnOpen.eventFormId)
        if (!eventForm){
          eventForm = this.caseService.startEventForm(caseEvent.id, this.caseService.caseDefinition.startFormOnOpen.eventFormId) 
        }
        await this.caseService.save()
        this.router.navigate(['case', 'event', 'form', eventForm.caseId, eventForm.caseEventId, eventForm.id])
      } else {
        this.router.navigate(['case', this.caseService.case._id])
      }
    })
  }
 
}
