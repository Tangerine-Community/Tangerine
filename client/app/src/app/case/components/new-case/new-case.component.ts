import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../core/auth/_services/authentication.service';
import { HttpClient } from '@angular/common/http';
import { CaseService } from '../../services/case.service'
import { CaseDefinitionsService } from '../../services/case-definitions.service'

@Component({
  selector: 'app-new-case',
  templateUrl: './new-case.component.html',
  styleUrls: ['./new-case.component.css']
})
export class NewCaseComponent implements OnInit {

  caseDefinitions:any;

  constructor(
    private router: Router,
    authenticationService: AuthenticationService,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    const caseDefinitionsService = new CaseDefinitionsService();
    this.caseDefinitions = await caseDefinitionsService.load();
  }

  async onCaseDefinitionSelect(caseDefinitionId = '') {
    const caseService = new CaseService()
    await caseService.create(caseDefinitionId)
    if (caseService.caseDefinition.startFormOnOpen && caseService.caseDefinition.startFormOnOpen.eventFormId) {
      const caseEvent = await caseService.startEvent(caseService.caseDefinition.startFormOnOpen.eventId)
      const eventForm = await caseService.startEventForm(caseEvent.id, caseService.caseDefinition.startFormOnOpen.eventFormId) 
      this.router.navigate(['case', 'event', 'form', eventForm.caseId, eventForm.caseEventId, eventForm.id])
    } else {
      this.router.navigate(['case', caseService.case._id])
    }
  }
}
