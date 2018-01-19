import { AfterContentInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { UserService } from '../core/auth/_services/user.service';

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
    this.iframe.nativeElement.addEventListener('ALL_ITEMS_CLOSED', () => {
      // navigate to homescreen
      this.router.navigate(['/home']);
    });
  }

  async getForm() {
    const userDB = await this.userService.getUserDatabase();
    this.formUrl = `../tangy-forms/index.html#form=../content/user-profile/form.html&database=${userDB}`;

  }

}
