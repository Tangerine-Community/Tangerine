import { AppInfo, DeviceService } from './../../../device/services/device.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  info:AppInfo
  ready = false

  constructor(
    private deviceService:DeviceService
  ) { }

  async ngOnInit() {
    const info = this.deviceService.getAppInfo()
    this.info = {
      ...info,
      deviceId: info.deviceId.substr(0,6)
    }
    this.ready = true
  }

}
