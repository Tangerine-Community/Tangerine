import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/auth/_services/user.service';
import PouchDB from 'pouchdb';


@Component({
  selector: 'app-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.css']
})
export class CasesComponent implements OnInit {

  cases = []

  constructor(
    private userService: UserService
  ) { }

  async ngOnInit() {
    const userDbName = await this.userService.getUserDatabase();
    const db = new PouchDB(userDbName);
    this.cases = (await db.allDocs({include_docs: true}))
      .rows
      .map(row => row.doc)
      .filter(doc => doc.collection === 'CaseInstance')
  }

}
