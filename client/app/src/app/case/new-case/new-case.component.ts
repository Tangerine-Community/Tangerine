import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../core/auth/_services/authentication.service';
import { HttpClient } from '@angular/common/http';
import { CaseService } from '../case.service'
import { CaseDefinitionsService } from '../case-definitions.service'

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
    debugger
  }

  async onCaseDefinitionSelect(caseDefinitionId = '') {
    const caseService = new CaseService()
    await caseService.create(caseDefinitionId)
    this.router.navigate(['case', caseService.case._id])
  }
}
