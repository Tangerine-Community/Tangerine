import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../core/auth/_services/authentication.service';
import { HttpClient } from '@angular/common/http';
import PouchDB from 'pouchdb';
import UUID from 'uuid/v4';

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
    this.caseDefinitions = await this.http.get('./assets/case-definitions.json').toPromise();
  }

  async onCaseDefinitionSelect(caseDefinitionId = '') {
    const caseDefinitionSrc = this
      .caseDefinitions
      .find(caseDefinition => caseDefinition.id === caseDefinitionId)
      .src;
    const caseDefinition = await this.http.get(caseDefinitionSrc).toPromise();
    const caseInstance = { _id: UUID(), collection: 'CaseInstance', ...caseDefinition };
    const db = new PouchDB(localStorage.getItem('currentUser'));
    await db.put(caseInstance)
    this.router.navigate(['case', caseInstance._id])
  }
}
