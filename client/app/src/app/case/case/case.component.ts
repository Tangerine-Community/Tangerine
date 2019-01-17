import { Component, OnInit, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/auth/_services/user.service';
import PouchDB from 'pouchdb'
import { Case } from '../case.class'
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.css']
})
export class CaseComponent implements OnInit, AfterContentInit {

  caseInstance:Case;
  caseDefinition:any;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private userService: UserService
  ) { }

  async ngOnInit() {
  }

  async ngAfterContentInit() {
    this.route.params.subscribe(async params => {
      const db = new PouchDB(localStorage.getItem('currentUser'))
      this.caseInstance = await db.get(params['id'])
      const caseDefinitions:any = await this.http.get('./assets/case-definitions.json').toPromise();
      const caseDefinitionSrc = caseDefinitions
        .find(caseDefinition => caseDefinition.id === this.caseInstance.caseDefinitionId)
        .src;
      this.caseDefinition = await this.http.get(caseDefinitionSrc).toPromise();
    })
  }

}
