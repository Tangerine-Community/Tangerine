import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../_services/authentication.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';


@Component({
  selector: 'survey-login',
  templateUrl: './survey-login.component.html',
  styleUrls: ['./survey-login.component.css']
})
export class SurveyLoginComponent implements OnInit {

  errorMessage = '';
  returnUrl: string; // stores the value of the url to redirect to after login
  user = { accessCode: '' };
  @ViewChild('customLoginMarkup', {static: true}) customLoginMarkup: ElementRef;
  ready = false

  constructor(
    private authenticationService: AuthenticationService,
    private appConfigService: AppConfigService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  async ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || 'forms-list';

    if (await this.authenticationService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
      return;
    }
    this.customLoginMarkup.nativeElement.innerHTML = await this.authenticationService.getCustomLoginMarkup()
    this.ready = true
  }
  async loginUser() {
    try {

      const appConfig = await this.appConfigService.getAppConfig();
      const groupId = appConfig['groupId'];

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
