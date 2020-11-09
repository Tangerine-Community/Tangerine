import { TangerineFormsService } from './../services/tangerine-forms.service';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-print-form-backup',
  templateUrl: './print-form-backup.component.html',
  styleUrls: ['./print-form-backup.component.css']
})
export class PrintFormBackupComponent implements OnInit {
  @ViewChild('container', {static: true}) container: ElementRef;
  groupDetails;
  meta;
  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private tangerineFormsService: TangerineFormsService,
    private groupsService: GroupsService) { }

  async ngOnInit() {
    const groupId = this.route.snapshot.paramMap.get('groupId');
    const formId = this.route.snapshot.paramMap.get('formId');
    this.groupDetails = await this.groupsService.getGroupInfo(groupId);
    const forms = await this.tangerineFormsService.getFormsInfo(groupId);
    const myForm = forms.find(e => e['id'] === formId);
    const formHtml = await this.http.get(`/editor/${groupId}/content/${myForm.id}/form.html`, { responseType: 'text' }).toPromise();
    const container = this.container.nativeElement;
    container.innerHTML = `
    <tangy-form-editor style="margin:15px;">${formHtml}</tangy-form-editor>
    `;
    container.querySelector('tangy-form').setAttribute('open-all-items', 'open-all-items');
  }

}
