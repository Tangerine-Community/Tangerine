import { Component, OnInit, NgModule } from '@angular/core';
import { QueriesService } from '../../services/queries.service';
import { Query } from '../../classes/query.class';


@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css']
})

export class QueryComponent implements OnInit {
  queries: Array<Query>
  constructor(
    private queriesService: QueriesService
  ) { }

  async ngOnInit() {
    this.queries = await this.queriesService.getQueries();
  }

}
