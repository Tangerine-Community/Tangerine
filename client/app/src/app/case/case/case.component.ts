import { Component, OnInit, AfterContentInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/auth/_services/user.service';
import PouchDB from 'pouchdb'
import { Case } from '../classes/case.class'
import { CaseEvent } from '../classes/case-event.class'
import { HttpClient } from '@angular/common/http';
import { CaseService } from '../case.service'

@Component({
  selector: 'app-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.css']
})
export class CaseComponent implements OnInit, AfterContentInit {
  caseService:CaseService;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private userService: UserService
  ) { }
  async ngOnInit() {
  }
  async ngAfterContentInit() {
    this.route.params.subscribe(async params => {
      const caseService = new CaseService()
      await caseService.load(params.id)
      this.caseService = caseService
    })
  }

  async startEvent(eventDefinitionId) {
    const caseEvent = this.caseService.startEvent(eventDefinitionId)
    await this.caseService.save()
    this.router.navigate(['case', 'event', this.caseService.case._id, caseEvent.id])
  }

}
