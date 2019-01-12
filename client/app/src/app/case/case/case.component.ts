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

  case = {};

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) { }

  async ngOnInit() {
  }

  async ngAfterContentInit() {
    this.route.queryParams.subscribe(async params => {
      const db = new PouchDB(this.userService.getUserDbName())
      this.case = await db.get(params['id'])
    })
  }

}
