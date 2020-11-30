import { TangerineFormsService } from './../services/tangerine-forms.service';
import { Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-print-stimuli-screen',
  templateUrl: './print-stimuli-screen.component.html',
  styleUrls: ['./print-stimuli-screen.component.css']
})
export class PrintStimuliScreenComponent implements OnInit {
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
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formHtml;
    const template = tempDiv.querySelectorAll('template');
    const container = this.container.nativeElement;
    container.innerHTML = `
    <div style="margin:15px; display:none;" print>${formHtml}</div>
    `;
    this.meta = (container.querySelector('tangy-form')).getMeta();
    this.meta?.items.forEach(section => section.inputs.forEach(input => {
      if (input.tagName === 'TANGY-TIMED' || input.tagName === 'TANGY-UNTIMED') {
        input.gridItem = true;
        input.gridParts = splitArray(input.value, input.columns);
      }
    }));
  }
}

const splitArray = (arr, length) => Array.from({ length: arr.length % length === 0 ?
  arr.length / length : (arr.length / length) + 1}, (_, i) => arr.splice(0, length));
