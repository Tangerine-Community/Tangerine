import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-group-releases',
  templateUrl: './group-releases.component.html',
  styleUrls: ['./group-releases.component.css']
})
export class GroupReleasesComponent implements OnInit {

  @Input() groupId:string

  constructor() { }

  ngOnInit() {
  }

}
