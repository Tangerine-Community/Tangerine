import { Component, OnInit, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/auth/_services/user.service';
import PouchDB from 'pouchdb'



@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit, AfterContentInit {

  case = {};

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) { }

  ngOnInit() {
  }

  async ngAfterContentInit() {
    this.route.queryParams.subscribe(async params => {
      const db = new PouchDB(this.userService.getUserDbName())
      this.case = await db.get(params['id'])
    })
  }


}
