import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-group-uploads',
  templateUrl: './group-uploads.component.html',
  styleUrls: ['./group-uploads.component.css']
})
export class GroupUploadsComponent implements OnInit {

  title = _TRANSLATE('Uploads')
  breadcrumbs:Array<Breadcrumb> = []
 
  groupId:string

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Uploads'),
        url: 'uploads'
      }
    ]
    this.route.params.subscribe(async params => {
      this.groupId = params.groupId
    })
  }

}
