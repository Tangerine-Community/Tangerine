import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CaseManagementService } from '../../case-management/_services/case-management.service';
import { UserService } from '../../core/auth/_services/user.service';

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
    private userService: UserService
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
        this.formUrl = `../tangy-forms/index.html#form=${form[index]['src']}&database=${userDB}&responseId=${this.responseId}`;
      } else {
        console.error('Item not Found');
      }
    } catch (error) {
      console.error('Could not load list of Forms');
    }
  }

}
