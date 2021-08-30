import { DeviceService } from './../../device/services/device.service';
import { InjectionToken } from '@angular/core';
import { TangyFormService } from 'src/app/tangy-forms/tangy-form.service';
import { SyncService } from './../../sync/sync.service';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { UserService } from 'src/app/shared/_services/user.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-associate-user-profile',
  templateUrl: './associate-user-profile.component.html',
  styleUrls: ['./associate-user-profile.component.css']
})
export class AssociateUserProfileComponent implements OnInit {

  @ViewChild('container', {static: true}) container: ElementRef;

  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: UserService,
    private appConfigService: AppConfigService,
    private syncService: SyncService,
    private deviceService: DeviceService,
    private tangyFormService:TangyFormService
  ) { }

  async ngOnInit() {
    const appConfig = await this.appConfigService.getAppConfig()
    const deviceInfo = await this.deviceService.getDevice()
    const lowestLevelOfLocation = deviceInfo.assignedLocation.value[deviceInfo.assignedLocation.value.length-1]
    let userProfiles = await this.tangyFormService.getResponsesByFormId('user-profile')
    // Filter out any Device Admin profiles which have no content.
    userProfiles = userProfiles.filter(userProfile => userProfile.items && userProfile.items[0])
    if (!appConfig.disableDeviceUserFilteringByAssignment) {
      const localUserProfiles = userProfiles.filter(profile => profile.location[lowestLevelOfLocation.level] === lowestLevelOfLocation.value)
      userProfiles = localUserProfiles
    }
    const userAccounts = await this.userService.getAllUserAccounts()
    const availableUserProfiles = userProfiles.filter((userProfile) => !userAccounts.find(userAccount => userAccount.userUUID === userProfile._id))
    this.container.nativeElement.innerHTML = `
      <tangy-form id="user-profile-select-form">
        <tangy-form-item id="user-profile-select-item">
          <tangy-select name="user-profile-select" required>
            ${availableUserProfiles.map(userProfile => `
              <option value="${userProfile._id}">
                ${userProfile.items[0].inputs
                  .filter(input => typeof input.value === 'string')
                  .map(input => `${input.name}: ${input.value}`).join(', ')}
              </option>
            `).join('')}
          </tangy-select>
        </tangy-form-item>
      </tangy-form>
    `

    this.container.nativeElement.querySelector('tangy-form')
      .addEventListener('submit', () => this.onSubmit())


  }

  async onSubmit() {
    const appConfig = await this.appConfigService.getAppConfig()
    const db = await this.userService.getUserDatabase()
    const usersDb = this.userService.getUsersDatabase()
    const userAccount = await this.userService.getUserAccount(this.userService.getCurrentUser())
    try {
      const profileToReplace = await db.get(userAccount.userUUID)
      await db.remove(profileToReplace)
    } catch(e) {
      // It's ok if this fails. It's probably because they are trying again and the profile has already been deleted.
    }
    userAccount.userUUID = this.container.nativeElement.querySelector('tangy-form').inputs.find(input => input.name === 'user-profile-select').value
    userAccount.initialProfileComplete = true
    await usersDb.put(userAccount)
    this.router.navigate([`/${appConfig.homeUrl}`] );
  }


}
