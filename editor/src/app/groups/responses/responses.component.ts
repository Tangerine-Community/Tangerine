import { Component, OnInit, Input } from '@angular/core';
import { GroupsService } from '../services/groups.service';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment'

@Component({
  selector: 'app-responses',
  templateUrl: './responses.component.html',
  styleUrls: ['./responses.component.css']
})
export class ResponsesComponent implements OnInit {

  @Input() groupName = '';
  moment;
  responses;
  forms = [];

  constructor(
    private groupsService: GroupsService,
    private http: HttpClient
  ) {
    this.moment = moment
  }

  async ngOnInit() {
    let responses = await this.http.get(`/api/${this.groupName}/responses`).toPromise()
    this.responses = responses
    this.forms = await this.groupsService.getFormsList(this.groupName);
  }

  async filterByForm(event) {
    if (event.target.value === '*') {
      let responses = await this.http.get(`/api/${this.groupName}/responses`).toPromise()
      this.responses = responses
    } else {
      let responses = await this.http.get(`/api/${this.groupName}/responsesByFormId/${event.target.value}`).toPromise()
      this.responses = responses
    }
  }

}
