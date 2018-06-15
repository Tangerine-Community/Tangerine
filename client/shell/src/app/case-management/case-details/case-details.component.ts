import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/auth/_services/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-case-details',
  templateUrl: './case-details.component.html',
  styleUrls: ['./case-details.component.css']
})
export class CaseDetailsComponent implements OnInit {
  formUrl;
  locationId;
  constructor(private userService: UserService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.locationId = params['locationId'];
      this.setURL();
    });
  }

  async setURL() {
    const userDbName = await this.userService.getUserDatabase();
    this.formUrl = `../tangy-forms/index.html#form_src=./assets/content/reports/form.html&hide_top_bar=true&database_name=${userDbName}&locationId=${this.locationId}`;
  }

}
