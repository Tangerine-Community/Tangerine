import { UserService } from '../core/auth/_services/user.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, AfterViewInit, Renderer, ViewChild } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, AfterViewInit {

  formUrl;
  constructor(private route: ActivatedRoute, private userService: UserService, private renderer: Renderer) { }

  ngOnInit() {

    this.getForm();
  }
  async getForm() {
    const userDB = await this.userService.getUserDatabase();
    const responseId = await this.userService.getUserProfileId();
    // console.log(userDB);
    this.formUrl =
      `/tangy-forms/index.html?form=/content/user-profile/form.html&database=${userDB}&response-id=${responseId}`;

  }

  ngAfterViewInit() {

  }
}
