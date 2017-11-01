import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  formUrl;
  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.getForm();
  }
  getForm() {

  }
}
