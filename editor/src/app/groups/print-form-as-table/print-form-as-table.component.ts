import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';

@Component({
  selector: 'app-print-form-as-table',
  templateUrl: './print-form-as-table.component.html',
  styleUrls: ['./print-form-as-table.component.css']
})
export class PrintFormAsTableComponent implements OnInit {
  @ViewChild('container') container: ElementRef;
  groupDetails;
  meta;
  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private appConfigService: AppConfigService,
    private groupsService: GroupsService) { }

  async ngOnInit() {
    const groupId = this.route.snapshot.paramMap.get('groupId');
    const formId = this.route.snapshot.paramMap.get('formId');
    this.groupDetails = await this.groupsService.getGroupInfo(groupId);
    const forms = await this.groupsService.getFormsList(groupId);
    const myForm = forms.find(e => e['id'] === formId);
    const formHtml = await this.http.get(`/editor/${groupId}/content/${myForm.id}/form.html`, { responseType: 'text' }).toPromise();
    const container = this.container.nativeElement;
    const appConfig = await this.appConfigService.getAppConfig(groupId);
    const appConfigCategories = appConfig.categories;
    const categories = JSON.stringify(appConfigCategories);
    container.innerHTML = `
    <tangy-form-editor style="margin:15px; display:none;" categories ='${categories}' print>${formHtml}</tangy-form-editor>
    `;
    this.meta = (container.querySelector('tangy-form')).getMeta();
  }

}
