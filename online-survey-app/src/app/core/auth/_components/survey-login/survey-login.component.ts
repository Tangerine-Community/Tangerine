import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../_services/authentication.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';

@Component({
  selector: 'survey-login',
  templateUrl: './survey-login.component.html',
  styleUrls: ['./survey-login.component.css']
})
export class SurveyLoginComponent implements OnInit {

  errorMessage = '';
  returnUrl: string; // stores the value of the url to redirect to after login
  user = { accessCode: '' };
  @ViewChild('customLoginMarkup', {static: false}) customLoginMarkup: ElementRef;
  ready = false
  groupId: string;

  constructor(
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  async ngOnInit() {
    this.groupId = this.route.snapshot.params['groupId'];
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] ||
                      sessionStorage.getItem('caseUrlHash') ||
                      'forms-list';

    if (await this.authenticationService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
      return;
    }
    this.ready = true

    await this.renderCustomLoginMarkup();
  }

  async renderCustomLoginMarkup() {
    let customLoginMarkup = '<img id="logo" src="/logo.png" width="100%">';
    try {
      const markup = await this.authenticationService.getCustomLoginMarkup();
      if (markup) {
        customLoginMarkup = markup;
      }
    } catch (error) {
      //pass
    }

    this.customLoginMarkup.nativeElement.innerHTML = customLoginMarkup
  }

  async loginUser() {
    try {
      const groupId = this.route.snapshot.params['groupId'];
      if (await this.authenticationService.surveyLogin(groupId, this.user.accessCode)) {
        this.router.navigate([this.returnUrl]);
      } else {
        this.errorMessage = _TRANSLATE('Login Unsuccessful');
      }
    } catch (error) {
      this.errorMessage = _TRANSLATE('Login Unsuccessful');
      console.error(error);
    }
  }

}
