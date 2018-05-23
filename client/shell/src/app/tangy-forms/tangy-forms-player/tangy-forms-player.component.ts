import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CaseManagementService } from '../../case-management/_services/case-management.service';
import { UserService } from '../../core/auth/_services/user.service';
import { WindowRef } from '../../core/window-ref.service';
import { _TRANSLATE } from '../../shared/translation-marker';

@Component({
  selector: 'app-tangy-forms-player',
  templateUrl: './tangy-forms-player.component.html',
  styleUrls: ['./tangy-forms-player.component.css']
})
export class TangyFormsPlayerComponent implements OnInit {
  formUrl;
  formIndex: number;
  responseId;
  constructor(
    private caseManagementService: CaseManagementService,
    private route: ActivatedRoute,
    private userService: UserService,
    private windowRef: WindowRef
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.formIndex = +params['formIndex'] || 0;
      this.responseId = params['responseId'];
      this.getForm(this.formIndex);
    });
  }
  async getForm(index = 0) {
    try {
      const userDB = await this.userService.getUserDatabase();
      const form = await this.caseManagementService.getFormList();
      if (!(index >= form.length)) {
        // Relative path to tangy forms app.
        let formUrl = `../tangy-forms/index.html#form_src=${form[index]['src']}&database_name=${userDB}`;
        if (this.responseId) {
          formUrl += `&response_id=${this.responseId}`;
        }
        this.windowRef.nativeWindow.location = formUrl;
      } else {
        console.error('Item Not Found');
      }
    } catch (error) {
      console.error('Could Not Load List Of Forms');
    }
  }

}
