import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/shared/_services/user.service';
import { DeviceSyncComponent } from '../device-sync/device-sync.component';

@Component({
  selector: 'app-device-resync',
  templateUrl: './device-resync.component.html',
  styleUrls: ['./device-resync.component.css']
})
export class DeviceResyncComponent implements OnInit {

  @ViewChild('stepDeviceSync', {static: true}) stepDeviceSync:DeviceSyncComponent
  
  constructor(
    private userService:UserService,
    private routerService:Router
  ) { }

  ngOnInit(): void {
    if (this.userService.isLoggedIn()) {
      this.stepDeviceSync.done$.subscribe(async (value) => {
        await this.userService.logout()
        this.routerService.navigate([''])
      })
      this.stepDeviceSync.sync()
    } else {
      this.routerService.navigate(['login'])
    }

  }

}
