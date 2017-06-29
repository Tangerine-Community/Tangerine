import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'tangerine-form-pager',
  templateUrl: './tangerine-form-pager.component.html',
  styleUrls: ['./tangerine-form-pager.component.css']
})
export class TangerineFormPagerComponent implements OnInit {

  _tangerineFormSession: any;
  @Output() clickedNext = new EventEmitter();
  @Output() clickedPrevious = new EventEmitter();

  ngOnInit() {
  }

}
