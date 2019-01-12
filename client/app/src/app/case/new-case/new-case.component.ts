import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../core/auth/_services/authentication.service';
import { HttpClient } from '@angular/common/http';
import PouchDB from 'pouchdb';

// TODO
function uuid() {
  return 'some-uuid'
}

@Component({
  selector: 'app-new-case',
  templateUrl: './new-case.component.html',
  styleUrls: ['./new-case.component.css']
})
export class NewCaseComponent implements OnInit {

  caseDefinitions = [];

  constructor(
    private route: ActivatedRoute,
    authenticationService: AuthenticationService,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.caseDefinitions = await this.http.get('./assets/case-definitions.json').toPromise()
  }

  onCaseDefinitionSelect(caseDefinitionId) {
    let caseDefinition = await this.http.get(`./assets/${this.caseDefinitions.find(caseDefinition => caseDefinition.caseDefinitionId === caseDefinitionId).src}`)
    let case = {_id: uuid(), ...caseDefinition}
    const db = new PouchDB(authenticationService.getCurrentUserDBPath());
    await db.put(case)
    this.route.navigate(['case', case._id])
  }
}
