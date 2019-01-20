import { Component, OnInit, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../core/auth/_services/user.service';
import { CaseService } from '../case.service'
import { CaseEvent } from '../classes/case-event.class'



@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit, AfterContentInit {

  caseService:CaseService
  caseEvent:CaseEvent

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) { }

  ngOnInit() {
  }

  async ngAfterContentInit() {
    this.route.params.subscribe(async params => {
      this.caseService = new CaseService()
      await this.caseService.load(params.caseId)
      // @TODO Why is TS having issues with not seeing that CaseEvent comes out of
      // case.events?
      const caseEvent = this
        .caseService
        .case
        .events
        .find(caseEvent => caseEvent.id === params.eventId)
      this.caseEvent = caseEvent
    })
  }


}
