import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AppConfigService } from '../../_services/app-config.service';
import {VariableService} from "../../_services/variable.service";

@Component({
  selector: 'app-redirect-to-default-route',
  templateUrl: './redirect-to-default-route.component.html',
  styleUrls: ['./redirect-to-default-route.component.css']
})
export class RedirectToDefaultRouteComponent implements OnInit {
  window:any;
  constructor(
    private router: Router, 
    private appConfigService: AppConfigService, 
    private activatedRoute: ActivatedRoute,
    private variableService: VariableService
  ) {
    this.window = window;
  }

  async ngOnInit() {
    const defaultUrl = '/forms-list';
    
    const incompleteResponseId = await this.variableService.get('incomplete-response-id')
    if (this.window.T.appConfig.config.forceCompleteForms === true && incompleteResponseId) {
      this.router.navigate([`/tangy-forms/resume/${incompleteResponseId}`]);
    } else {
      const home_url = await this.appConfigService.getDefaultURL();
      this.router.navigate([home_url]).then(data => {
        /**
         * When the user has supplied a route that cannot be matched from the
         * app-config.json redirect the user to the default url
         * It checks if the  current route after the  first router.navigate
         * call is still the register route and redirects to the default url
         */
        if (this.router.url === '/redirect') {
          this.router.navigate([defaultUrl]);
        }
      });
    }
    
  }

}
