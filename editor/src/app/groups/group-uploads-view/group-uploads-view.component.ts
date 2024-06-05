import { TangyFormsPlayerComponent } from './../../tangy-forms/tangy-forms-player/tangy-forms-player.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TangyFormService } from 'src/app/tangy-forms/tangy-form.service';

@Component({
  selector: 'app-group-uploads-view',
  templateUrl: './group-uploads-view.component.html',
  styleUrls: ['./group-uploads-view.component.css']
})
export class GroupUploadsViewComponent implements OnInit {

  title = _TRANSLATE('View Upload')
  breadcrumbs:Array<Breadcrumb> = []
  @ViewChild('formPlayer', {static: true}) formPlayer: TangyFormsPlayerComponent
  responseId
  groupId
 
  constructor(
    private route:ActivatedRoute,
    private router:Router,
    private http: HttpClient,
    private tangyFormService: TangyFormService,
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.responseId = params.responseId
      this.groupId = params.groupId
      this.breadcrumbs = [
        <Breadcrumb>{
          label: _TRANSLATE('Uploads'),
          url: 'uploads'
        },
        <Breadcrumb>{
          label: this.title,
          url: `uploads/${params.responseId}`
        }
      ]
      this.formPlayer.formResponseId = params.responseId
      this.formPlayer.render()
      this.formPlayer.$submit.subscribe(async () => {
        this.formPlayer.saveResponse(this.formPlayer.formEl.store.getState())
        this.router.navigate([`../`], { relativeTo: this.route })
      })
    })
  }

  async delete(){
    if(confirm('Are you sure you want to delete this form response?')) {
      await this.http.delete(`/api/${this.groupId}/${this.responseId}`).toPromise()
      this.router.navigate([`../`], { relativeTo: this.route })
    }
  }

  async verify(){
    try {
      const data = {...this.formPlayer.formEl.store.getState(), verified:true};
      await this.tangyFormService.saveResponse(data)
      alert(_TRANSLATE('Verified successfully.'))
    } catch (error) {
      alert(_TRANSLATE('Verification was unsuccessful. Please try again.'))
      console.log(error)
    }
  }

}
