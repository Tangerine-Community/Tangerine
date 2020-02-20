import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-group-uploads-view',
  templateUrl: './group-uploads-view.component.html',
  styleUrls: ['./group-uploads-view.component.css']
})
export class GroupUploadsViewComponent implements OnInit {

  title = _TRANSLATE('View Upload')
  breadcrumbs:Array<Breadcrumb> = []
 
  constructor(
    private route:ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.breadcrumbs = [
        <Breadcrumb>{
          label: _TRANSLATE('Uploads'),
          url: 'uploads'
        },
        <Breadcrumb>{
          label: this.title,
          url: `uploads/view/${params.responseId}` 
        }
      ]
    })
  }

}
