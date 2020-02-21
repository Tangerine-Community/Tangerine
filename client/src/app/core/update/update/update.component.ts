import { Subject } from 'rxjs';
import { UpdateService } from './../../../shared/_services/update.service';
import { DeviceService } from './../../../device/services/device.service';
import { AppConfigService } from './../../../shared/_services/app-config.service';
import { Component, AfterContentInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { updates } from './updates';
import PouchDB from 'pouchdb';
import { UserService } from '../../../shared/_services/user.service';
import { _TRANSLATE } from '../../../shared/translation-marker';
import { TranslateService } from '@ngx-translate/core';
import { Device } from 'src/app/device/classes/device.class';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})
export class UpdateComponent implements AfterContentInit {

  message = _TRANSLATE('Checking For Updates...');
  totalUpdatesApplied = 0;
  needsUpdating = false;
  complete = false;

  constructor(
    private deviceService:DeviceService,
    private updateService:UpdateService,
    private appConfigService:AppConfigService,
    private userService: UserService
  ) { }

  async ngAfterContentInit() {
    this.updateService.status$.subscribe({next: message => {
      this.message = message
    }})
    const appConfig = await this.appConfigService.getAppConfig()
    if (await this.appConfigService.syncProtocol2Enabled() && !await this.updateService.sp2_updateRequired()) {
      this.message = _TRANSLATE('✓ Yay! You are up to date.')
    } else if (await this.appConfigService.syncProtocol2Enabled() && await this.updateService.sp2_updateRequired()) {
      if (!this.userService.getCurrentUser()) {
        this.message = _TRANSLATE('The update has been downloaded. Please log in to complete the update.')
      } else {
        await this.updateService.sp2_processUpdates()
        await this.deviceService.didUpdate()
        this.message = _TRANSLATE('✓ Yay! You are up to date.')
      }
    } else if (appConfig.syncProtocol !== '2' && this.updateService.sp1_updateRequired()) {
      await this.updateService.sp1_processUpdates()
      this.message = _TRANSLATE('✓ Yay! You are up to date.')
    } else {
      this.message = _TRANSLATE('✓ Yay! You are up to date.')
    }
    this.complete = true
  }


}
