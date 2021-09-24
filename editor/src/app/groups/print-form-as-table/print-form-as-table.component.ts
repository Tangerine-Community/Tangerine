import { TangerineFormsService } from './../services/tangerine-forms.service';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import {Breadcrumb} from "../../shared/_components/breadcrumb/breadcrumb.component";
import {_TRANSLATE} from "../../shared/_services/translation-marker";
import * as XLSX from "xlsx";

@Component({
  selector: 'app-print-form-as-table',
  templateUrl: './print-form-as-table.component.html',
  styleUrls: ['./print-form-as-table.component.css']
})
export class PrintFormAsTableComponent implements OnInit {
  @ViewChild('container', {static: true}) container: ElementRef;
  groupDetails;
  groupLabel;
  meta;
  myForm;
  breadcrumbs:Array<Breadcrumb> = []
  title = _TRANSLATE("Form Metadata")
  isExporting: boolean;
  
  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private tangerineFormsService:TangerineFormsService,
    private appConfigService: AppConfigService,
    private groupsService: GroupsService) { }

  async ngOnInit() {
    
    const groupId = this.route.snapshot.paramMap.get('groupId');
    this.groupDetails = await this.groupsService.getGroupInfo(groupId);
    this.groupLabel = this.groupDetails.label;
    const formId = this.route.snapshot.paramMap.get('formId');
    this.breadcrumbs = [
      <Breadcrumb>{
        label: formId,
        url: formId
      }
    ]
    
    const forms = await this.tangerineFormsService.getFormsInfo(groupId);
    this.myForm = forms.find(e => e['id'] === formId);
    const formHtml = await this.http.get(`/editor/${groupId}/content/${this.myForm.id}/form.html`, { responseType: 'text' }).toPromise();
    const container = this.container.nativeElement;
    container.innerHTML = `
      ${formHtml}
    `;
    this.meta = (container.querySelector('tangy-form')).getMeta();
    console.log("hoot")
  }

  async export() {
    this.isExporting = true;
    // const worksheet = XLSX.utils.json_to_sheet(this.deviceInfos);
    // const workbook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(workbook, worksheet, 'devices');
    // XLSX.writeFile(workbook, 'devices.xlsx');
    // this.isExporting = false;
  }

}
