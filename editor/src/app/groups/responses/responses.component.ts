import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment'

@Component({
  selector: 'app-responses',
  templateUrl: './responses.component.html',
  styleUrls: ['./responses.component.css']
})
export class ResponsesComponent implements OnInit {

  @Input() responses = [];
  moment;

  constructor() {
    this.moment = moment
  }

  ngOnInit() {
  }

}
