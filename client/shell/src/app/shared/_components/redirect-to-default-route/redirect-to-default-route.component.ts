import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppConfigService } from '../../_services/app-config.service';

@Component({
  selector: 'app-redirect-to-default-route',
  templateUrl: './redirect-to-default-route.component.html',
  styleUrls: ['./redirect-to-default-route.component.css']
})
export class RedirectToDefaultRouteComponent implements OnInit {

  constructor(private router: Router, private appConfigService: AppConfigService) { }

  async ngOnInit() {
    const home_url = '/case-management' && await this.appConfigService.getDefaultURL();
    this.router.navigate([home_url]);
  }

}
