import { Router, ActivatedRoute } from '@angular/router';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { generateFlatResponse } from './tangy-form-response-flatten';
import { TangerineFormsService } from './../services/tangerine-forms.service';
import { Component, OnInit, Input,ViewChild, ElementRef } from '@angular/core';
import { GroupsService } from '../services/groups.service';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment'
import { t } from 'tangy-form/util/t.js'
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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
  @ViewChild('searchBar', {static: true}) searchBar: ElementRef
  @ViewChild('searchResults', {static: true}) searchResults: ElementRef
  onSearch$ = new Subject()

  ready = false

  moment;
  responses;
  skip = 0;
  limit = 30;
  forms = [];
  locationLists
  searchString
  initialResults = []

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
    this.ready = true;
    this.onSearch$
      .pipe(debounceTime(300))
      .subscribe((searchString:string) => {
        this.responses.length <= 0 ? this.searchResults.nativeElement.innerHTML = 'Searching...' : null
        this.onSearch(searchString)
      });
    this
      .searchBar
      .nativeElement
      .addEventListener('keyup', event => {
        const searchString = event.target.value.trim()
        if (searchString.length > 2) {
          if (this.searchString === searchString) return;
          this.searchResults.nativeElement.innerHTML = 'Searching...'
          this.onSearch$.next(event.target.value)
        } if(searchString.length <= 2 && searchString.length !==0 ) {
          this.searchResults.nativeElement.innerHTML = `
            <span style="padding: 25px">
              ${t('Enter more than two characters...')}
            </span>
          `
        }
      })
  }

  async getResponses() {
    this.locationLists = await this.groupsService.getLocationLists(this.groupId);
    let responses = []
    if (this.filterBy === '*') {
      responses = <Array<any>>await this.http.get(`/api/${this.groupId}/responses/${this.limit}/${this.skip}`).toPromise()
    } else {
      responses = <Array<any>>await this.http.get(`/api/${this.groupId}/responsesByFormId/${this.filterBy}/${this.limit}/${this.skip}`).toPromise()
    }
    const flatResponses = []
    for (let response of responses) {
      const flatResponse = await generateFlatResponse(response, this.locationLists, false)
      this.excludeColumns.forEach(column => delete flatResponse[column])
      flatResponses.push(flatResponse)
    }
    this.responses = flatResponses 
    this.initialResults = flatResponses
  }

  async onSearch(searchString) {
    this.searchString = searchString
    this.responses = []
    if (searchString === '') {
      this.searchResults.nativeElement.innerHTML = ''
      this.responses = this.initialResults
      return 
    }
    const responses = <Array<any>>await this.http.get(`/api/${this.groupId}/responses/${this.limit}/${this.skip}/?id=${searchString}`).toPromise()
    const flatResponses = []
    for (let response of responses) {
      const flatResponse = await generateFlatResponse(response, this.locationLists, false)
      this.excludeColumns.forEach(column => delete flatResponse[column])
      flatResponses.push(flatResponse)
    }
    this.responses = flatResponses
    this.responses.length > 0 ? this.searchResults.nativeElement.innerHTML = '': this.searchResults.nativeElement.innerHTML = 'No results matching the criteria.'
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
    if(this.searchString){
      this.onSearch(this.searchString)
    } else{
      this.getResponses();
    }
  }

  previousPage() {
    this.skip = this.skip - this.limit
    if(this.searchString){
      this.onSearch(this.searchString)
    } else{
    this.getResponses();
    }
  }

  onRowEdit(row) {
    this.router.navigate([row._id ? row._id : row.id], {relativeTo: this.route})
  }

  onRowDelete(row) {
    this.deleteResponse(row._id ? row._id : row.id)
  }

}
