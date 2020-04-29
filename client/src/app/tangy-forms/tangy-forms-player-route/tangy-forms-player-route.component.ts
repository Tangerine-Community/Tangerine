import { UserService } from 'src/app/shared/_services/user.service';
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
  templateId:string
  location:any

  constructor(
    private route:ActivatedRoute,
    private userService:UserService 
  ) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(async params => {
      this.formPlayer.location = await this.userService.getUserLocation()
      if (params['templateId']) {
        this.formPlayer.formResponseId = params['formResponseId'] 
        this.formPlayer.templateId = params['templateId']
        this.formPlayer.render()
      } else {
        this.formPlayer.formResponseId = params['formResponseId'] 
        this.formPlayer.formId = params['formId']
        this.formPlayer.render()
      }
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
