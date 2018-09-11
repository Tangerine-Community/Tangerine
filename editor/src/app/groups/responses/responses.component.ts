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
  skip = 0;
  limit = 30;
  filter = '*';
  forms = [];

  constructor(
    private groupsService: GroupsService,
    private http: HttpClient
  ) {
    this.moment = moment
  }

  async ngOnInit() {
    this.forms = await this.groupsService.getFormsList(this.groupName);
    await this.getResponses()
  }

  async getResponses() {
    if (this.filter === '*') {
      let responses = await this.http.get(`/api/${this.groupName}/responses/${this.limit}/${this.skip}`).toPromise()
      this.responses = responses
    } else {
      let responses = await this.http.get(`/api/${this.groupName}/responsesByFormId/${this.filter}/${this.limit}/${this.skip}`).toPromise()
      this.responses = responses
    }
  }

  async filterByForm(event) {
    this.filter = event.target['value'];
    this.skip = 0;
    this.getResponses();
  }

  async deleteResponse(id) {
    if(confirm('Are you sure you want to delete this form response?')) {
      await this.http.delete(`/api/${this.groupName}/${id}`).toPromise()
      this.getResponses()
    }
  }

  nextPage() {
    this.skip = this.skip + this.limit
    this.getResponses();
  }

  previousPage() {
    this.skip = this.skip - this.limit
    this.getResponses();
  }




}
