import { Component, OnInit, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/auth/_services/user.service';
import PouchDB from 'pouchdb'

@Component({
  selector: 'app-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.css']
})
export class CaseComponent implements OnInit, AfterContentInit {

  caseInstance = {};

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) { }

  async ngOnInit() {
  }

  async ngAfterContentInit() {
    this.route.params.subscribe(async params => {
      const db = new PouchDB(localStorage.getItem('currentUser'))
      this.caseInstance = await db.get(params['id'])
    })
  }

}
