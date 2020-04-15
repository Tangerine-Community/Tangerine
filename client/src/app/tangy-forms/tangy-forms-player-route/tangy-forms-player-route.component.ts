import { TangyFormsPlayerComponent } from './../tangy-forms-player/tangy-forms-player.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-tangy-forms-player-route',
  templateUrl: './tangy-forms-player-route.component.html',
  styleUrls: ['./tangy-forms-player-route.component.css']
})
export class TangyFormsPlayerRouteComponent implements OnInit {

  @ViewChild('formPlayer', {static: true}) formPlayer:TangyFormsPlayerComponent

  private sub:any
  formResponseId:string
  formId:string

  constructor(
    private route:ActivatedRoute
  ) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
       this.formResponseId = params['formResponseId'] 
       this.formId = params['formId']
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  isDirty() {
    return this.formPlayer.isDirty()
  }

  isComplete() {
    return this.formPlayer.isComplete()
  }

}
