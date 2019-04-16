import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../shared/_services/user.service';
import PouchDB from 'pouchdb';
import { Case } from '../../classes/case.class'

@Component({
  selector: 'app-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.css']
})
export class CasesComponent implements OnInit {

  cases:Array<Case> = []
  numberOfOpenCases:number 

  constructor(
    private userService: UserService
  ) { }

  async ngOnInit() {
    const userDbName = await this.userService.getUserDatabase();
    const db = new PouchDB(userDbName);
    this.cases = (await db.allDocs({include_docs: true}))
      .rows
      .map(row => row.doc)
      .filter(doc => doc.collection === 'TangyFormResponse' && doc.type === 'Case')
    this.numberOfOpenCases = this.cases.filter(caseInstance => caseInstance.complete === false).length
  }

}