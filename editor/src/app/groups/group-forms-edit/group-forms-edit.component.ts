import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { TangerineFormsService } from './../services/tangerine-forms.service';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-group-forms-edit',
  templateUrl: './group-forms-edit.component.html',
  styleUrls: ['./group-forms-edit.component.css']
})
export class GroupFormsEditComponent implements OnInit {

  title = ""
  breadcrumbs:Array<Breadcrumb> = []

  constructor(
    private tangerineForms: TangerineFormsService
  ) { }

  async ngOnInit() {
    const params = window.location.hash.split('/')
    const forms = await this.tangerineForms.getFormsInfo(params[2])
    const form = forms.find(form => form.id === params[6])
    this.title = `${_TRANSLATE('Edit Form')}: ${form.title}`
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Forms'),
        url: 'forms'
      },
      <Breadcrumb>{
        label: form.title,
        url: `forms/edit/${form.id}`
      }
    ]
  }

}
