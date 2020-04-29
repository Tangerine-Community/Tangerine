import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { GroupsService } from '../services/groups.service';
import { TangerineFormsService } from '../services/tangerine-forms.service';

@Component({
  selector: 'app-copy-form',
  templateUrl: './copy-form.component.html',
  styleUrls: ['./copy-form.component.css']
})
export class CopyFormComponent implements OnInit {

  @Input('formId') formId:string
  @Input('sourceGroupId') sourceGroupId:string
  @Output('done') done = new EventEmitter();
  @ViewChild('selectElement', {static: true}) selectElement: ElementRef
  groups:Array<any> = []


  constructor(
    private groupsService:GroupsService,
    private tangerineForms:TangerineFormsService
  ) { }

  async ngOnInit() {
    this.groups = <Array<any>>await this.groupsService.getAllGroups()
    this.selectElement.nativeElement.innerHTML = `
      ${this.groups.map(group => `
        <option value="${group._id}">${group.label}</option>
      `).join('')}
    `
  }

  async onSelect() {
    await this.tangerineForms.copyForm(this.formId, this.sourceGroupId, this.selectElement.nativeElement.value)
    this.selectElement.nativeElement.value = ''
    this.done.emit()
  }

}
