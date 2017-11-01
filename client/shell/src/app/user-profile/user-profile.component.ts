import { UserService } from '../core/auth/_services/user.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit,AfterViewInit, Renderer,ViewChild } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, AfterViewInit {

  formUrl;
  constructor(private route: ActivatedRoute, private userService: UserService, private renderer: Renderer) { }

  ngOnInit() {
    this.renderer.listenGlobal('window', 'scroll', (evt) => {
      frames['ifr'].document.documentElement.scrollTop = window.pageYOffset;
      frames['ifr'].document.body.scrollTop = window.pageYOffset;
      window.dispatchEvent(new Event('resize'));
    });
    this.renderer.listenGlobal('window', 'resize', (evt) => {
      document.body.style.height = frames['ifr'].document.body.offsetHeight + parseInt(document.getElementById('tangy_iframe_container').style.top) + parseInt(document.getElementById('tangy_iframe_container').style.bottom) + 'px'
    });
    this.getForm();
  }
  async getForm() {
    const userDB = await this.userService.getUserDatabase();
    const responseId = await this.userService.getUserProfileId();
    // console.log(userDB);
    this.formUrl =
      `/tangy-forms/index.html?form=/content/user-profile/form.html&database=${userDB}&response-id=${responseId}`;
      
  }

  ngAfterViewInit(){
    document.body.style.height = frames['ifr'].document.body.offsetHeight + parseInt(document.getElementById('tangy_iframe_container').style.top) + parseInt(document.getElementById('tangy_iframe_container').style.bottom) + 'px';
    
  }
}
