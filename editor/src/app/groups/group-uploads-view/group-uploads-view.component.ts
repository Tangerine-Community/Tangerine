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
  formResponse
 
  constructor(
    private route:ActivatedRoute,
    private router:Router,
    private http: HttpClient,
    private tangyFormService: TangyFormService,
  ) { }

  async ngOnInit() {
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

      this.ready();
    })
  }

  async ready() {
    // Load the form response instead of passing the responseId to the form player.
    // If you pass the responseId, but the form player already has a response, responseId will be ignored
    this.formResponse = await this.tangyFormService.getResponse(this.responseId)
    this.formPlayer.response = this.formResponse
    await this.formPlayer.render()
  }

  async archive(){
    if(confirm('Are you sure you want to archive this form response?')) {
      try {
        const data = {...this.formPlayer.formEl.store.getState(), archived:true};
        const result = await this.tangyFormService.saveResponse(data)
        if(result){
          alert(_TRANSLATE('Archived successfully.'))
          this.router.navigate([`../`], { relativeTo: this.route })
        }else{
          alert(_TRANSLATE('Archival was unsuccessful. Please try again.'))
        }
      } catch (error) {
        alert(_TRANSLATE('Archival was unsuccessful. Please try again.'))
        console.log(error)
      }
    }
  }
  async unarchive(){
    if(confirm(_TRANSLATE('Are you sure you want to unarchive this form response?'))) {
      try {
        const data = {...this.formPlayer.formEl.store.getState(), archived:false};
        const result = await this.tangyFormService.saveResponse(data)
        if(result){
          alert(_TRANSLATE('Unarchived successfully.'))
          this.router.navigate([`../`], { relativeTo: this.route })
        }else{
          alert(_TRANSLATE('Unarchival was unsuccessful. Please try again.'))
        }
      } catch (error) {
        alert(_TRANSLATE('Unarchival was unsuccessful. Please try again.'))
        console.log(error)
      }
    }
  }

  async verify(){
    try {
      const data = {...this.formPlayer.formEl.store.getState(), verified:true};
      const result = await this.tangyFormService.saveResponse(data)
      if(result){
        alert(_TRANSLATE('Verified successfully.'))
        this.router.navigate([`../`], { relativeTo: this.route })
      }else{
        alert(_TRANSLATE('Verification was unsuccessful. Please try again.'))
      }
    } catch (error) {
      alert(_TRANSLATE('Verification was unsuccessful. Please try again.'))
      console.log(error)
    }
  }
  async unverify(){
    try {
      const data = {...this.formPlayer.formEl.store.getState(), verified:false};
      const result = await this.tangyFormService.saveResponse(data)
      if(result){
        alert(_TRANSLATE('Unverified successfully.'))
        this.router.navigate([`../`], { relativeTo: this.route })
      }else{
        alert(_TRANSLATE('Unverification was unsuccessful. Please try again.'))
      }
    } catch (error) {
      alert(_TRANSLATE('Unverification was unsuccessful. Please try again.'))
      console.log(error)
    }
  }

}
