import { Component, OnInit, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CaseService } from '../../services/case.service'
import { CaseDefinitionsService } from '../../services/case-definitions.service'
import { EventForm } from '../../classes/event-form.class';
import { ProcessMonitorService } from 'src/app/shared/_services/process-monitor.service';
import { _TRANSLATE } from 'src/app/shared/translation-marker';

@Component({
  selector: 'app-new-case',
  templateUrl: './new-case.component.html',
  styleUrls: ['./new-case.component.css'],
  providers: [ CaseService ]
})
export class NewCaseComponent implements AfterContentInit {

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private caseService:CaseService,
    private caseDefinitionsService:CaseDefinitionsService,
    private processMonitorService:ProcessMonitorService
  ) { }

  async ngAfterContentInit() {
    const process = this.processMonitorService.start('newCaseSaving', _TRANSLATE('Creating new case...'))
    this.activatedRoute.queryParams.subscribe(async params => {
      const formId = params['formId'];
      const caseDefinitions = await this.caseDefinitionsService.load();
      await this.caseService.create(caseDefinitions.find(caseDefinition => caseDefinition.formId === formId).id)
      this.caseService.openCaseConfirmed = true
      if (this.caseService.caseDefinition.startFormOnOpen && this.caseService.caseDefinition.startFormOnOpen.eventFormId) {
        const caseEvent = this.caseService.case.events.find(event => event.caseEventDefinitionId === this.caseService.caseDefinition.startFormOnOpen.eventId)
        const eventForm = caseEvent.eventForms.find(eventForm => eventForm.eventFormDefinitionId === this.caseService.caseDefinition.startFormOnOpen.eventFormId)
        this.router.navigate(['case', 'event', 'form', eventForm.caseId, eventForm.caseEventId, eventForm.id])
      } else {
        this.router.navigate(['case', this.caseService.case._id])
      }
      this.processMonitorService.stop(process.id)
    })
  }
 
}
