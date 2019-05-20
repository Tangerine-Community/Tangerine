import { Component, OnInit, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../../shared/_services/authentication.service';
import { HttpClient } from '@angular/common/http';
import { CaseService } from '../../services/case.service'
import { CaseDefinitionsService } from '../../services/case-definitions.service'
import { WindowRef } from 'src/app/shared/_services/window-ref.service';

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
    private windowRef: WindowRef
  ) { }

  async ngAfterContentInit() {
    this.activatedRoute.queryParams.subscribe(async params => {
      const formId = params['formId'];
      const caseService = new CaseService({ databaseName: localStorage.getItem('currentUser'), window: this.windowRef.nativeWindow })
      const caseDefinitionsService = new CaseDefinitionsService();
      const caseDefinitions = await caseDefinitionsService.load();
      await caseService.create(caseDefinitions.find(caseDefinition => caseDefinition.formId === formId).id)
      if (caseService.caseDefinition.startFormOnOpen && caseService.caseDefinition.startFormOnOpen.eventFormId) {
        const caseEvent = caseService
          .case
          .events
          .find(event => event.caseEventDefinitionId === caseService.caseDefinition.startFormOnOpen.eventId)
        const eventForm = caseService.startEventForm(caseEvent.id, caseService.caseDefinition.startFormOnOpen.eventFormId) 
        await caseService.save()
        this.router.navigate(['case', 'event', 'form', eventForm.caseId, eventForm.caseEventId, eventForm.id])
      } else {
        this.router.navigate(['case', caseService.case._id])
      }
    })
  }
 
}
