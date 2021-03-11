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
    this.info = this.deviceService.getAppInfo()
    this.ready = true
  }

}
