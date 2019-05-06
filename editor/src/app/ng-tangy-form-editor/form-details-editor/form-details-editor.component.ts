import { Component, OnInit, Input } from '@angular/core';
import { FormsInfoService } from 'src/app/shared/_services/forms-info.service';
import { FormInfo } from 'src/app/shared/_classes/form-info.class';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'form-details-editor',
  templateUrl: './form-details-editor.component.html',
  styleUrls: ['./form-details-editor.component.css']
})
export class FormDetailsEditorComponent implements OnInit {

  formId:string
  formInfo:FormInfo

  constructor(
    private activatedRoute: ActivatedRoute,
    private formsInfoService: FormsInfoService
  ) { }

  async ngOnInit() {
    this.formId = this.activatedRoute.snapshot.paramMap.get('formId');
    const formsInfo = await this.formsInfoService.getFormsInfo()
    this.formInfo = formsInfo.find(formInfo => formInfo.id === this.formId)
  }

}
