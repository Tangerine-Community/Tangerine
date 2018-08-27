import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-responses',
  templateUrl: './responses.component.html',
  styleUrls: ['./responses.component.css']
})
export class ResponsesComponent implements OnInit {

  @Input() responses = [];

  constructor() { }

  ngOnInit() {
  }

}
