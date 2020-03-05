import { VariableService } from './../../../shared/_services/variable.service';
import { Subject } from 'rxjs';
import { UpdateService, VAR_UPDATE_IS_RUNNING } from './../../../shared/_services/update.service';
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

export const VARIABLE_FINISH_UPDATE_ON_LOGIN = 'VARIABLE_FINISH_UPDATE_ON_LOGIN'

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
    private variableService:VariableService,
    private userService: UserService
  ) { }

  async ngAfterContentInit() {

    // Set a debugger statement for debugging updates on troubled devices.
    debugger

    // Subscribe UI to update messages.
    this.updateService.status$.subscribe({next: message => {
      this.message = message
    }})

    /*
     * SP1
     */

    if (
      !await this.appConfigService.syncProtocol2Enabled() &&
      await this.updateService.sp1_updateRequired()
    ) {
      await this.updateService.sp1_processUpdates()
      await this.variableService.set(VAR_UPDATE_IS_RUNNING, false)
      this.message = _TRANSLATE('✓ Yay! You are up to date.')
    }

    if (
      !await this.appConfigService.syncProtocol2Enabled() &&
      !await this.updateService.sp1_updateRequired()
    ) {
      await this.variableService.set(VAR_UPDATE_IS_RUNNING, false)
      this.message = _TRANSLATE('✓ Yay! You are up to date.')
    }

    /*
     * SP2
     */

    if (
      await this.appConfigService.syncProtocol2Enabled() &&
      !this.userService.isLoggedIn()
    ) {
      // Set VAR__UPDATE_IS_RUNNING so LoginComponent knows to redirect back to here after authenticating.
      await this.variableService.set(VAR_UPDATE_IS_RUNNING, true)
      this.message = _TRANSLATE('Please log in to complete the update.')
    }   
    
    if (
      await this.appConfigService.syncProtocol2Enabled() &&
      this.userService.isLoggedIn()
    ) {
      await this.updateService.sp2_processUpdates()
      await this.variableService.set(VAR_UPDATE_IS_RUNNING, false)
      await this.deviceService.didUpdate()
      this.message = _TRANSLATE('✓ Yay! You are up to date.')
    } 

    /*
     * Show the button to proceed.
     */
    
    this.complete = true

  }

}
