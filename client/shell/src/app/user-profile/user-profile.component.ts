import { AfterContentInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { UserService } from '../core/auth/_services/user.service';
import { TangyFormService } from '../tangy-forms/tangy-form-service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements AfterContentInit {

  tangyFormSrc: any;
  tangyFormResponse: {};
  //@ViewChild(TangyFormLoaderComponent) tangyFormLoader: TangyFormLoaderComponent 
  @ViewChild('container') container: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) { }

  async ngAfterContentInit() {
    const userDbName = await this.userService.getUserDatabase();
    const tangyFormService = new TangyFormService({ databaseName: userDbName });
    const profileDocs = await tangyFormService.getResponsesByFormId('user-profile');
    const container = this.container.nativeElement
    let formHtml = await fetch('./assets/content/user-profile/form.html')
    container.innerHTML = await formHtml.text()
    let formEl = container.querySelector('tangy-form')
    formEl.addEventListener('ALL_ITEMS_CLOSED', async () => {
      const profileDoc = formEl.store.getState()
      await tangyFormService.saveResponse(profileDoc)
      this.router.navigate(['/forms-list']);
    })
    // Put a response in the store by issuing the FORM_OPEN action.
    if (profileDocs.length > 0) {
      formEl.store.dispatch({ type: 'FORM_OPEN', response: profileDocs[0] })
    } 
  }

}
