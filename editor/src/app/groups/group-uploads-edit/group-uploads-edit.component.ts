import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { TangyFormsPlayerComponent } from 'src/app/tangy-forms/tangy-forms-player/tangy-forms-player.component';
import { TangyFormService } from 'src/app/tangy-forms/tangy-form.service';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';

@Component({
  selector: 'app-group-uploads-edit',
  templateUrl: './group-uploads-edit.component.html',
  styleUrls: ['./group-uploads-edit.component.css']
})
export class GroupUploadsEditComponent implements OnInit {

  title = _TRANSLATE('Edit Upload')
  breadcrumbs:Array<Breadcrumb> = []
  @ViewChild('formPlayer', {static: true}) formPlayer: TangyFormsPlayerComponent

  groupId:string
  responseId:string
  userProfileId:string
  tabletUserName:string
  appConfig: any
 
  constructor(
    private route:ActivatedRoute,
    private router:Router,
    private tangyFormService: TangyFormService,
    private appConfigService: AppConfigService
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupId = params.groupId
      this.responseId = params.responseId
      this.breadcrumbs = [
        <Breadcrumb>{
          label: _TRANSLATE('Uploads'),
          url: 'uploads'
        },
        <Breadcrumb>{
          label: _TRANSLATE('View Upload'),
          url: `uploads/${this.responseId}` 
        },
        <Breadcrumb>{
          label: this.title,
          url: `uploads/${this.responseId}/edit` 
        }
      ]
    
      this.ready();
    })
  }

  async ready() {
    try {
      // In SP1, the response contains the userProfileId and tabletUserName in the first item input.
      // Editing the form inadvertently removes those values because they are not in the form HTML.
      // To prevent this, we need to store these values and add them back in when saving the response.
      this.appConfig = await this.appConfigService.getAppConfig()
      if (this.appConfig.syncProtocol === '1') {
        this.tangyFormService.initialize(this.groupId);
        let response = await this.tangyFormService.getResponse(this.responseId)

        if (response) {
          var inputs = response.items.reduce(function(acc, item) { return acc.concat(item.inputs)}, [])
          this.userProfileId = inputs.find(input => input.name === 'userProfileId')?.value
          this.tabletUserName = inputs.find(input => input.name === 'tabletUserName')?.value
        }
      }
    } catch(e) {
      console.error(e)
    }

    this.formPlayer.formResponseId = this.responseId
    this.formPlayer.render()
    this.formPlayer.$submit.subscribe(async () => {
      let response = this.formPlayer.formEl.store.getState();

      if (this.appConfig.syncProtocol === '1' && this.userProfileId && this.tabletUserName) {
        // In SP1, restore the userProfileId and tabletUserName to the response.
        var inputs = response.items.reduce(function(acc, item) { return acc.concat(item.inputs)}, [])
        if (!inputs.find(input => input.name === 'userProfileId')) {
          response['items'][0]['inputs'].push({ name: 'userProfileId', value: this.userProfileId });
        }
        if (!inputs.find(input => input.name === 'tabletUserName')) {
          response['items'][0]['inputs'].push({ name: 'tabletUserName', value: this.tabletUserName });
        }
      }

      this.formPlayer.saveResponse(response)
      this.router.navigate([`../`], { relativeTo: this.route })
    })
  }
}
