import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { TangyFormsPlayerComponent } from 'src/app/tangy-forms/tangy-forms-player/tangy-forms-player.component';

@Component({
  selector: 'app-group-uploads-edit',
  templateUrl: './group-uploads-edit.component.html',
  styleUrls: ['./group-uploads-edit.component.css']
})
export class GroupUploadsEditComponent implements OnInit {

  title = _TRANSLATE('Edit Upload')
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
          label: _TRANSLATE('View Upload'),
          url: `uploads/${params.responseId}` 
        },
        <Breadcrumb>{
          label: this.title,
          url: `uploads/${params.responseId}/edit` 
        }
      ]
      this.formPlayer.formResponseId = params.responseId
      this.formPlayer.unlockFormResponses = true
      this.formPlayer.render()
      this.formPlayer.$submit.subscribe(async () => {
        this.formPlayer.saveResponse(this.formPlayer.formEl.store.getState())
        this.router.navigate([`../`], { relativeTo: this.route })
      })
    })
  }

}
