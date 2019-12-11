import { HttpClient } from '@angular/common/http';
import { GroupDevicesService } from './../services/group-devices.service';
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { GroupDevice } from '../classes/group-device.class';
import * as qrcode from 'qrcode-generator-es6';


interface DeviceInfo {
  _id:string
  claimed:boolean
  assignedLocation:string
  syncLocations:string
}

const MODE_LIST = 'MODE_LIST'
const MODE_EDIT = 'MODE_EDIT'

@Component({
  selector: 'app-group-devices',
  templateUrl: './group-devices.component.html',
  styleUrls: ['./group-devices.component.css']
})
export class GroupDevicesComponent implements OnInit {

  @Input() groupId:string
  mode = MODE_LIST
  deviceInfos:Array<DeviceInfo>
  @ViewChild('modeEditContainer') modeEditContainer: ElementRef

  constructor(
    private groupDevicesService:GroupDevicesService,
    private httpClient:HttpClient
  ) { }

  async ngOnInit() {
    this.listDevices()
  }

  async listDevices() {
    this.mode = MODE_LIST
    const devices = await this.groupDevicesService.list(this.groupId)
    this.deviceInfos = devices.map(device => {
      return <DeviceInfo>{
        ...device,
        assignedLocation: device.assignedLocation.value ? device.assignedLocation.value.map(value => `${value.level}: ${value.value}`).join(', ') : '',
        syncLocations: device.syncLocations.map(syncLocation => {
          return syncLocation.value.map(value => `${value.level}: ${value.value}`).join(', ')
        }).join('; ')
      }
    })
  }

  async addDevice() {
    const device = <GroupDevice>await this.groupDevicesService.createDevice(this.groupId)
    this.editDevice(device._id)

  }

  async editDevice(deviceId) {
    const locationList = <any>await this.httpClient.get('./assets/location-list.json').toPromise()
    this.mode = MODE_EDIT
    const device = await this.groupDevicesService.getDevice(this.groupId, deviceId)
    this.modeEditContainer.nativeElement.innerHTML = `
      <tangy-form>
        <tangy-form-item id="edit-device" on-change="
        ">
          <tangy-input name="_id" label="ID" value="${device._id}" disabled></tangy-input>
          <tangy-input name="token" label="Token" value="${device.token}" disabled></tangy-input>
          <tangy-checkbox name="claimed" label="Claimed" value="${device.claimed ? 'on' : ''}" disabled></tangy-checkbox>
          <tangy-input name="assigned_location__show_levels" label="Assign device to location at which level?" value='${device.assignedLocation.showLevels.join(',')}'></tangy-input>
          <tangy-input name="assigned_location__value" label="Assign device to location at which location?" value='${JSON.stringify(device.assignedLocation.value)}'></tangy-input>
          <tangy-input name="sync_location__show_levels" label="Sync device to location at which level?" value='${device.syncLocations[0].showLevels.join(',')}'></tangy-input>
          <tangy-input name="sync_location__value" label="Sync device to location at which location?" value='${JSON.stringify(device.syncLocations[0].value)}'></tangy-input>
        </tangy-form-item>
      </tangy-form>
      ${!device.claimed ? `
        <h2>Registration QR</h2>
        <div id="qr"></div>
      ` : ''}
    `
    if (!device.claimed) {
      const qr = new qrcode.default(0, 'H')
      qr.addData(`{"id":"${device._id}","token":"${device.token}"}`)
      qr.make()
      this.modeEditContainer.nativeElement.querySelector('#qr').innerHTML = qr.createSvgTag({cellSize:500, margin:0,cellColor:(c, r) =>''})
    }
    this.modeEditContainer.nativeElement.querySelector('tangy-form').addEventListener('submit', async (event) => {
      device.assignedLocation.value = JSON.parse(event.target.getValue('assigned_location__value'))
      device.assignedLocation.showLevels = event.target.getValue('assigned_location__show_levels').split(',')
      device.syncLocations[0].value = JSON.parse(event.target.getValue('sync_location__value'))
      device.syncLocations[0].showLevels = event.target.getValue('sync_location__show_levels').split(',')
      await this.groupDevicesService.updateDevice(this.groupId, device)
      this.listDevices()
    })

  }

}
