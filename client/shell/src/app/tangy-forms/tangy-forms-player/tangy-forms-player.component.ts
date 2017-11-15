import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CaseManagementService } from '../../case-management/_services/case-management.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tangy-forms-player',
  templateUrl: './tangy-forms-player.component.html',
  styleUrls: ['./tangy-forms-player.component.css']
})
export class TangyFormsPlayerComponent implements OnInit {
  formUrl;
  formIndex: number;
  constructor(private caseManagementService: CaseManagementService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.formIndex = +params['formIndex'] || 0;
      this.getForm(this.formIndex);
    });
  }
  async getForm(index = 0) {
    try {
      const form = await this.caseManagementService.getFormList();
      if (!(index >= form.length)) {
        // @TODO: Add user database like '&database=' + userDbName
        this.formUrl = '/tangy-forms/index.html#form=/content/' + form[index]['src'];
      } else {
        console.error('Item not Found');
      }
    } catch (error) {
      console.error('Could not load list of Forms');
    }
  }

}
