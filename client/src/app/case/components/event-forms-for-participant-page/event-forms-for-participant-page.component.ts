import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-event-forms-for-participant-page',
  templateUrl: './event-forms-for-participant-page.component.html',
  styleUrls: ['./event-forms-for-participant-page.component.css']
})
export class EventFormsForParticipantPageComponent implements OnInit {

  ready = false
  caseId:string
  eventId:string
  participantId:string
  breadcrumbUrl = ''
  breadcrumbText = ''

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.caseId = params.caseId
      this.eventId = params.eventId
      this.participantId = params.participantId
      this.breadcrumbText = window['breadcrumbText'] || this.breadcrumbText
      this.breadcrumbUrl = window['breadcrumbUrl'] || this.breadcrumbUrl
      this.ready = true
    })
  }

}
