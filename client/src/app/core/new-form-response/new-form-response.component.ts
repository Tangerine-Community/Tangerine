import { Component, OnInit, Output } from '@angular/core';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { Router } from '@angular/router';
import { FormType } from 'src/app/shared/_classes/form-type.class';
import { FormTypesService } from 'src/app/shared/_services/form-types.service';
import { Subject } from 'rxjs';
import { EventEmitter } from 'events';

@Component({
  selector: 'app-new-form-response',
  templateUrl: './new-form-response.component.html',
  styleUrls: ['./new-form-response.component.css']
})
export class NewFormResponseComponent implements OnInit {

  formsInfo:Array<FormInfo> = []
  formTypes:Array<FormType>
  @Output('ready')
  ready = new EventEmitter()
  @Output('navigating')
  navigating = new EventEmitter()

  constructor(
    private formsInfoService: TangyFormsInfoService,
    private formTypesService: FormTypesService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.formTypes = this.formTypesService.getFormTypes()
    this.formsInfo = (await this.formsInfoService.getFormsInfo()).filter(formInfo => formInfo.listed)
    // We need to make this variable available to evals using response variable do not throw errors even though they shouldn't because we always check/
    // for the variable. Not sure why it throws here.
    let response = undefined
    // Override titles to prepend icons.
    this.formsInfo = this.formsInfo.map(formInfo => {
      return <FormInfo>{
        ...formInfo,
        title: `
          ${formInfo.title}
        `
      }
    })
    this.ready.emit('ready')
  }

  onFormInfoSelect(formInfoId) {
    const formInfo = this.formsInfo.find(formInfo => formInfo.id === formInfoId)
    const formType = this.formTypes.find(formType => formInfo.type === formType.id)
    const formId = formInfo.id
    const url = eval(`\`${formType.newFormResponseLinkTemplate}\``)
    this.navigating.emit('navigating', {url})
    this.router.navigateByUrl(url)
  }

}
