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
  formsArray
  formMetadata
  onSubmit: string;
  onReSubmit: string;
  onChange: string;
  onOpen: string;
  sectionHooksArray
  
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
    this.formMetadata = {
      groupLabel: this.groupDetails?.label,
      groupId: this.groupDetails?._id,
      title: this.myForm.title,
      id: this.myForm.id,
    }
    const tangyForm = container.querySelector('tangy-form')
    this.onSubmit = tangyForm.getAttribute('on-submit')
    this.onReSubmit = tangyForm.getAttribute('on-resubmit')
    this.onChange = tangyForm.getAttribute('on-change')
    this.onOpen = tangyForm.getAttribute('on-open')
    
    this.meta = tangyForm.getMeta()
    this.formsArray = []
    this.sectionHooksArray = []
      this.meta.items.forEach(section => {
      const sectionId = section.id
      const onSubmit = section['on-submit']
      const onReSubmit = section['on-resubmit']
      const onChange = section['on-change']
      const onOpen = section['on-open']
      const sectionHooks = {
        sectionId: sectionId,
        onSubmit: onSubmit,
        onReSubmit: onReSubmit,
        onChange: onChange,
        onOpen: onOpen
      }
      this.sectionHooksArray.push(sectionHooks)
        
      section.inputs.forEach(input => {
        let inputItem = {
          sectionId: sectionId,
          name: input.name,
          label: input.label,
          hintText: input.hintText,
          required: input.required,
          disabled: input.disabled,
          hidden: input.hidden,
          dataType: undefined,
          options: undefined,
          inputType: undefined
        }
        let inputType
        if (input.tagName==='TANGY-SELECT') {
          inputType = 'single'
        } else if (input.tagName==='TANGY-RADIO-BUTTONS') {
          inputType = 'single'
        } else if (input.tagName==='TANGY-CHECKBOX') {
          inputType = 'single'
        } else if (input.tagName==='TANGY-CHECKBOXES') {
          inputType = 'multiple'
        }
        inputItem.inputType = inputType
        inputItem.dataType = input.type
        let options = ''
        if (input.value.length>0) {
          input.value.forEach((option, index) => {
            const showComma = index+1===input.value.length?'':' ,'
            options += `${option.value} "${option.label}" ${showComma}`
          })
        }
        inputItem.options = options
        this.formsArray.push(inputItem)
      })
    })
  }

  async export() {
    this.isExporting = true;
    const worksheet1 = XLSX.utils.json_to_sheet(this.formsArray);
    const worksheet2 = XLSX.utils.json_to_sheet(Object.entries(this.formMetadata));
    const hooks = []
    hooks.push({
      onSubmit: this.onSubmit,
      onReSubmit: this.onReSubmit,
      onChange: this.onChange,
      onOpen: this.onOpen,
    })
    const worksheet3 = XLSX.utils.json_to_sheet(hooks);
    const worksheet4 = XLSX.utils.json_to_sheet(this.sectionHooksArray);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet1, 'form inputs');
    XLSX.utils.book_append_sheet(workbook, worksheet2, 'form metadata');
    XLSX.utils.book_append_sheet(workbook, worksheet3, 'form hooks');
    XLSX.utils.book_append_sheet(workbook, worksheet4, 'section hooks');
    XLSX.writeFile(workbook, 'data_dictionary.xlsx');
    this.isExporting = false;
  }

}
