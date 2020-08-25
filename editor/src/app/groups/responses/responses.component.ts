import { Router, ActivatedRoute } from '@angular/router';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { generateFlatResponse } from './tangy-form-response-flatten';
import { TangerineFormsService } from './../services/tangerine-forms.service';
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

  @Input() groupId = '';
  @Input() filterBy:string = '*'
  @Input() excludeForms:Array<string> = []
  @Input() excludeColumns:Array<string> = []
  @Input() hideFilterBy = false

  ready = false

  moment;
  responses;
  skip = 0;
  limit = 30;
  forms = [];

  constructor(
    private groupsService: GroupsService,
    private tangerineFormsService:TangerineFormsService,
    private appConfigService:AppConfigService,
    private route:ActivatedRoute,
    private http: HttpClient,
    private router:Router
  ) {
    this.moment = moment
  }

  async ngOnInit() {
    this.forms = (await this.tangerineFormsService.getFormsInfo(this.groupId))
      .filter(formInfo => !this.excludeForms.includes(formInfo.id) )
    await this.getResponses()
    this.ready = true
  }

  async getResponses() {
    const locationList = await this.http.get('./assets/location-list.json').toPromise()
    let responses = []
    if (this.filterBy === '*') {
      responses = <Array<any>>await this.http.get(`/api/${this.groupId}/responses/${this.limit}/${this.skip}`).toPromise()
    } else {
      responses = <Array<any>>await this.http.get(`/api/${this.groupId}/responsesByFormId/${this.filterBy}/${this.limit}/${this.skip}`).toPromise()
    }
    const flatResponses = []
    for (let response of responses) {
      const flatResponse = await generateFlatResponse(response, locationList, false)
      this.excludeColumns.forEach(column => delete flatResponse[column])
      flatResponses.push(flatResponse)
    }
    this.responses = flatResponses 
  }

  async filterByForm(event) {
    this.filterBy = event.target['value'];
    this.skip = 0;
    this.getResponses();
  }

  async deleteResponse(id) {
    if(confirm('Are you sure you want to delete this form response?')) {
      await this.http.delete(`/api/${this.groupId}/${id}`).toPromise()
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

  onRowClick(row) {
    this.router.navigate([row._id], {relativeTo: this.route})
  }

}
