import { AfterContentInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { UserService } from '../core/auth/_services/user.service';
import { TangyFormService } from '../tangy-forms/tangy-form-service'

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, AfterContentInit {

  @ViewChild('iframe') iframe: ElementRef;
  formUrl;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) { }


  ngOnInit() {
    this.getForm();
  }

  ngAfterContentInit() {

  }

  async getForm() {
    const userDbName = await this.userService.getUserDatabase();
    // @TODO: Look for form doc in user db, add response_id to url params if there is one.
    let tangyFormService = new TangyFormService({databaseName: userDbName});
    let profileDocs = await tangyFormService.getResponsesByFormId('user-profile')
    if (profileDocs.length > 0) {
      this.formUrl = `../tangy-forms/index.html#form_src=../content/user-profile/form.html&hide_top_bar=true&database_name=${userDbName}&response_id=${profileDocs[0]._id}`;
    } else {
      this.formUrl = `../tangy-forms/index.html#form_src=../content/user-profile/form.html&hide_top_bar=true&database_name=${userDbName}`;
    }
    // This protects against binding again an element that does not yet exist because the
    // the this.formUrl property was just set, the *ngIf="formUrl" on iframe will be in the
    // process of producing that element.
    setTimeout(() => {
      this.iframe.nativeElement.addEventListener('ALL_ITEMS_CLOSED', () => {
        // navigate to homescreen
        console.log("navigating to case-management")
        this.router.navigate(['/case-management']);
      });
    }, 1500);

  }

}
