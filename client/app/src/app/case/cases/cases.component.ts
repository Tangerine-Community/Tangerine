import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/auth/_services/user.service';
import PouchDB from 'pouchdb';

@Component({
  selector: 'app-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.css']
})
export class CasesComponent implements OnInit {

  constructor(
    private userService: UserService,
  ) { }

  async ngOnInit() {
    const userDbName = await this.userService.getUserDatabase();
    const db = new PouchDB(userDbName);
    const caseDocs = await db.allDocs({include_docs: true})
      .filter(doc => doc.collection === 'case')
  }

}
