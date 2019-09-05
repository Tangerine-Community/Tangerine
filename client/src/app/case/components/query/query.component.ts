import { Component, OnInit, NgModule } from '@angular/core';
import { Query } from '../../classes/query.class';
import { CaseService } from '../../services/case.service';


@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css']
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
