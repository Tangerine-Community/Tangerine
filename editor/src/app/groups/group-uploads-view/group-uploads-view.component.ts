import { TangyFormsPlayerComponent } from './../../tangy-forms/tangy-forms-player/tangy-forms-player.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-group-uploads-view',
  templateUrl: './group-uploads-view.component.html',
  styleUrls: ['./group-uploads-view.component.css']
})
export class GroupUploadsViewComponent implements OnInit {

  title = _TRANSLATE('View Upload')
  breadcrumbs:Array<Breadcrumb> = []
  @ViewChild('formPlayer', {static: true}) formPlayer: TangyFormsPlayerComponent
 
  constructor(
    private route:ActivatedRoute,
    private router:Router
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
      this.formPlayer.formResponseId = params.responseId
      this.formPlayer.unlockFormResponses = true
      this.formPlayer.render()
      this.formPlayer.$submit.subscribe(async () => {
        this.router.navigate([`../`], { relativeTo: this.route })
      })
    })
  }

}
