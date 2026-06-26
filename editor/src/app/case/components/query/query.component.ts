  
import { Component, OnInit, NgModule, ChangeDetectionStrategy } from '@angular/core';
import { CaseService } from '../../services/case.service';
import { Query } from '../../classes/query.class';


@Component({
    selector: 'app-query',
    templateUrl: './query.component.html',
    styleUrls: ['./query.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class QueryComponent implements OnInit {
  queries: Array<Query>
  constructor(
    private caseService: CaseService
  ) { }

  async ngOnInit() {
    this.queries = await this.caseService.getQueries();
  }

}