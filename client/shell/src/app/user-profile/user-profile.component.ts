import { UserService } from '../core/auth/_services/user.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  formUrl;
  constructor(private route: ActivatedRoute, private userService: UserService) { }

  ngOnInit() {
    this.getForm();
  }
  async getForm() {
    const userDB = await this.userService.getUserDatabase();
    const responseId = await this.userService.getUserProfileId();
    this.formUrl =
      `/tangy-forms/index.html?form=/content/user-profile/form.html&database=${userDB}&response-id=${responseId}`;

  }

}
