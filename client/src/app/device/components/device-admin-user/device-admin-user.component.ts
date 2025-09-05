import { _TRANSLATE } from '../../../shared/translation-marker';
import { Subject } from 'rxjs';
import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Route } from '@angular/router';
import { UserProfileComponent } from 'src/app/user-profile/user-profile.component';

@Component({
  selector: 'app-device-admin-user',
  templateUrl: './device-admin-user.component.html',
  styleUrls: ['./device-admin-user.component.css']
})
export class DeviceAdminUserComponent {
  showUserProfile = false;
  done$:Subject<string> = new Subject<string>()
  @ViewChild(UserProfileComponent) set userProfile(component: UserProfileComponent) {
    if (component) {
      component.done$.subscribe((userProfileId) => {
        this.done$.next(userProfileId);
      });
    }
  }

  constructor(
  ) { }

  load() {
    this.showUserProfile = true;
  }

}
