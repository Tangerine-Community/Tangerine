import { Component, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CaseManagementService } from '../../case-management/_services/case-management.service';
import { WindowRef } from '../../core/window-ref.service';
import 'tangy-form-editor/tangy-form-editor.js';

@Component({
  selector: 'app-tangerine-editor-form-editor',
  templateUrl: './tangerine-editor-form-editor.component.html',
  styleUrls: ['./tangerine-editor-form-editor.component.css']
})
export class TangerineEditorFormEditorComponent implements AfterContentInit {
  @ViewChild('container') container: ElementRef;
  formIndex: number;
  DatArchive: any;
  src: string;
  archive: any;

  constructor(
    private http: HttpClient,
    private windowRef: WindowRef,
    private caseManagementService: CaseManagementService,
    private route: ActivatedRoute
  ) { 
    this.DatArchive = this.windowRef.nativeWindow.DatArchive;
  }

  ngAfterContentInit() {
    this.route.queryParams.subscribe(async params => {
      this.formIndex = +params['formIndex'] || 0;
      const formInfo = await this.getFormInfoByIndex(this.formIndex);
      const container = this.container.nativeElement
      this.src = formInfo.src
      let formHtml =  await this.http.get(formInfo.src, {responseType: 'text'}).toPromise();
      container.innerHTML = `
        <tangy-form-editor>
          ${formHtml}
        </tangy-form-editor>
      `
      let formEditorEl = container.querySelector('tangy-form-editor')
      // Listen up, save in the db.
      let archive = new this.DatArchive(this.windowRef.nativeWindow.location.origin)
      formEditorEl.addEventListener('change', _ => {
        archive.writeFile(this.src.replace('./', '/'), formEditorEl.formHtml)

      })
    });
  }

  async getFormInfoByIndex(index = 0) {
    try {
      const form = await this.caseManagementService.getFormList();
      if (!(index >= form.length)) {
        // Relative path to tangy forms app.
        return form[index]
      }
    } catch (err) { console.log(err) }

  }

}
