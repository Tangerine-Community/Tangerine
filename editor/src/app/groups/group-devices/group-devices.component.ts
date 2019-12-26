import { Loc } from 'tangy-form/util/loc.js';
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
    const locationList = await this.httpClient.get('./assets/location-list.json').toPromise()
    const flatLocationList = Loc.flatten(locationList)
    this.deviceInfos = devices.map(device => {
      return <DeviceInfo>{
        ...device,
        assignedLocation: device.assignedLocation.value ? device.assignedLocation.value.map(value => `<b>${value.level}</b>: ${flatLocationList.locations.find(node => node.id === value.value).label}`).join('<br>') : '',
        syncLocations: device.syncLocations.map(syncLocation => {
          return syncLocation.value.map(value => `<b>${value.level}</b>: ${flatLocationList.locations.find(node => node.id === value.value).label}`).join('<br>')
        }).join('; ')
      }
    })
  }

  async addDevice(deviceId:string) {
    const device = <GroupDevice>await this.groupDevicesService.createDevice(this.groupId)
    this.editDevice(device._id)
  }

  async resetDevice(deviceId:string) {
    const device = await this.groupDevicesService.resetDevice(this.groupId, deviceId)
    this.listDevices()
  }

  async deleteDevice(deviceId:string) {
    const device = await this.groupDevicesService.deleteDevice(this.groupId, deviceId)
    this.listDevices()
  }

  async editDevice(deviceId:string) {
    const locationList = <any>await this.httpClient.get('./assets/location-list.json').toPromise()
    this.mode = MODE_EDIT
    const device = await this.groupDevicesService.getDevice(this.groupId, deviceId)
    this.modeEditContainer.nativeElement.innerHTML = `
      ${!device.claimed ? `
        <h2>Registration QR</h2>
        <div id="qr" style="width: 300px"></div>
      ` : ''}
      <tangy-form>
        <tangy-form-item id="edit-device" on-change="
          const selectedALshowLevels = inputs.assigned_location__show_levels.value.slice(0, inputs.assigned_location__show_levels.value.findIndex(option => option.value === 'on')+1).map(option => option.name).join(',')
          inputs.assigned_location.setAttribute('show-levels',selectedALshowLevels)
          const selectedSLshowLevels = inputs.sync_location__show_levels.value.slice(0, inputs.sync_location__show_levels.value.findIndex(option => option.value === 'on')+1).map(option => option.name).join(',')
          inputs.sync_location.setAttribute('show-levels',selectedSLshowLevels)
        ">
          <tangy-input name="_id" label="ID" value="${device._id}" disabled></tangy-input>
          <tangy-input name="token" label="Token" value="${device.token}" disabled></tangy-input>
          <tangy-checkbox name="claimed" label="Claimed" value="${device.claimed ? 'on' : ''}" disabled></tangy-checkbox>
          <tangy-radio-buttons 
            ${device.assignedLocation && device.assignedLocation.showLevels ? `
              value='${
                JSON.stringify(
                  locationList.locationsLevels.map(level => {
                    return {
                      name:level,value:level === device.assignedLocation.showLevels.slice(-1)[0] ? 'on' : ''
                    }
                  })
                )
              }'
            ` : ''}
            label="Assign device to location at which level?" 
            name="assigned_location__show_levels"
          >
            ${locationList.locationsLevels.map(level => `
              <option value="${level}">${level}</option>
            `).join('')}
          </tangy-radio-buttons>
          <tangy-location 
            name="assigned_location" 
            label="Assign device to location at which location?" 
            ${device.assignedLocation && device.assignedLocation.value ? `
              show-levels='${device.assignedLocation.showLevels.join(',')}' 
              value='${JSON.stringify(device.assignedLocation.value)}'
            ` : ''}
          >
          </tangy-location>
          <tangy-radio-buttons 
            ${device.syncLocations && device.syncLocations[0] && device.syncLocations[0].showLevels ? `
              value='${
                JSON.stringify(
                  locationList.locationsLevels.map(level => {
                    return {
                      name:level,value:level === device.syncLocations[0].showLevels.slice(-1)[0] ? 'on' : ''
                    }
                  })
                )
              }'
            ` : ''}
            label="Sync device to location at which level?" 
            name="sync_location__show_levels"
          >
            ${locationList.locationsLevels.map(level => `
              <option value="${level}">${level}</option>
            `).join('')}
          </tangy-radio-buttons>
          <tangy-location 
            name="sync_location"
            label="Sync device to which location?" 
            ${device.syncLocations && device.syncLocations[0] && device.syncLocations[0].value ? `
              show-levels='${device.syncLocations[0].showLevels.join(',')}'
              value='${JSON.stringify(device.syncLocations[0].value)}'
            ` : ''}
          >
          </tangy-location>


        </tangy-form-item>
      </tangy-form>
    `
    if (!device.claimed) {
      const qr = new qrcode.default(0, 'H')
      qr.addData(`{"id":"${device._id}","token":"${device.token}"}`)
      qr.make()
      this.modeEditContainer.nativeElement.querySelector('#qr').innerHTML = qr.createSvgTag({cellSize:500, margin:0,cellColor:(c, r) =>''})
    }
    this.modeEditContainer.nativeElement.querySelector('tangy-form').addEventListener('submit', async (event) => {
      device.assignedLocation.value = event.target.inputs.find(input => input.name === 'assigned_location').value
      device.assignedLocation.showLevels = event.target.inputs.find(input => input.name === 'assigned_location').showLevels.split(',')
      device.syncLocations[0] = {
        value: event.target.inputs.find(input => input.name === 'sync_location').value,
        showLevels: event.target.inputs.find(input => input.name === 'sync_location').showLevels.split(',')
      }
      await this.groupDevicesService.updateDevice(this.groupId, device)
      this.listDevices()
    })

  }

}
