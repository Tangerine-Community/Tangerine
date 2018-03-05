import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AppConfigService } from '../../_services/app-config.service';

@Component({
  selector: 'app-redirect-to-default-route',
  templateUrl: './redirect-to-default-route.component.html',
  styleUrls: ['./redirect-to-default-route.component.css']
})
export class RedirectToDefaultRouteComponent implements OnInit {

  constructor(private router: Router, private appConfigService: AppConfigService, private activatedRoute: ActivatedRoute) {
  }

  async ngOnInit() {
    const defaultUrl = '/case-management';
    const home_url = await this.appConfigService.getDefaultURL();
    console.log("home_url: " + home_url)
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
