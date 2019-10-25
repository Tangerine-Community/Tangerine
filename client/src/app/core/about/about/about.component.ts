import { AboutService } from './../about.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  buildId:string

  constructor(
    private aboutService:AboutService

  ) { }

  async ngOnInit() {
    this.buildId = await this.aboutService.getBuildNumber()
  }

}
