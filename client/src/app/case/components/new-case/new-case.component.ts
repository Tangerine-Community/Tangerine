import { Component, OnInit, AfterContentInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../../shared/_services/authentication.service';
import { HttpClient } from '@angular/common/http';
import { CaseService } from '../../services/case.service'
import { CaseDefinitionsService } from '../../services/case-definitions.service'

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
    private activatedRoute: ActivatedRoute
  ) { }

  async ngAfterContentInit() {
    this.activatedRoute.queryParams.subscribe(async params => {
      const formId = params['formId'];
      const caseService = new CaseService()
      const caseDefinitionsService = new CaseDefinitionsService();
      const caseDefinitions = await caseDefinitionsService.load();
      await caseService.create(caseDefinitions.find(caseDefinition => caseDefinition.formId === formId).id)
      this.router.navigate(['case', caseService.case._id])
    })
  }
 
}
