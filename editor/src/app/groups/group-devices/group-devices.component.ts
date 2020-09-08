import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { GroupsService } from './../services/groups.service';
import { ActivatedRoute } from '@angular/router';
import { MenuService } from './../../shared/_services/menu.service';
import { HttpClient } from '@angular/common/http';
import { TangyFormService } from './../../tangy-forms/tangy-form.service';
import { GroupDevicesService } from './../services/group-devices.service';
import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { GroupDevice } from '../classes/group-device.class';
import { TangerineForm } from 'src/app/shared/_classes/tangerine-form.class';
import {TangyFormResponseModel} from 'tangy-form/tangy-form-response-model.js'
import { Loc } from 'tangy-form/util/loc.js';
import * as qrcode from 'qrcode-generator-es6';
import * as moment from 'moment'


interface LocationNode {
  level:string
  value:string
}

interface VersionStat {
  id:string
  percentage:number
}

interface DeviceInfo {
  _id:string
  claimed:boolean
  assignedLocation:string
  syncLocations:string
  token:string
}

interface UserField {
  name:string
  label:string
}

@Component({
  selector: 'app-group-devices',
  templateUrl: './group-devices.component.html',
  styleUrls: ['./group-devices.component.css']
})
export class GroupDevicesComponent implements OnInit {

  title = _TRANSLATE("Devices")
  breadcrumbs:Array<Breadcrumb> = []


  devices:Array<GroupDevice>
  users:Array<TangyFormResponseModel> = []
  deviceInfos:Array<DeviceInfo> = []
  userFields:Array<UserField>
  versionStats:Array<VersionStat>
  flatLocationList
  locationFilter:Array<LocationNode> = []
  tab = 'TAB_USERS'
  devicesDisplayedColumns = ['id', 'assigned-location', 'sync-location', 'claimed', 'registeredOn', 'syncedOn', 'updatedOn', 'version', 'star']

  @Input('groupId') groupId:string
  @ViewChild('dialog', {static: true}) dialog: ElementRef;
  @ViewChild('locationEl', {static: true}) locationEl: ElementRef;

  constructor(
    private menuService:MenuService,
    private route: ActivatedRoute,
    private httpClient:HttpClient,
    private groupsService:GroupsService,
    private groupDevicesService:GroupDevicesService,
  ) { }

  async ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: 'Devices',
        url: 'devices'
      }
    ]
    this.route.params.subscribe(async params => {
      this.groupId = params.groupId
      const group = await this.groupsService.getGroupInfo(params.groupId)
      //this.menuService.setContext(group.label, 'Deploy', 'deploy', group._id)
      const locationList = await this.httpClient.get('./assets/location-list.json').toPromise()
      this.flatLocationList = Loc.flatten(locationList)
      //this.locationEl.nativeElement.addEventListener('change', (event) => this.onLocationSelection(event.target.value))
      this.update()
    })
  }

  onLocationSelection(value:Array<LocationNode>) {
    this.locationFilter = value
    this.update()
  }

  deviceInLocationFilter(device:GroupDevice):Boolean {
    debugger
    return true
  }

  userInLocationFilter(device:GroupDevice):Boolean {
    debugger
    return true
  }

  async update() {
    /*
    const users = (await this.tangyFormService.getResponseByFormId(this.groupId, 'user-profile'))
      .filter(device => this.userInLocationFilter(device.assignedLocation))
    this.userFields = users.reduce((userFields, user) => {
      return [
        ...userFields,
        ...user.items[0].inputs
          .filter(input => input.type === 'TANGY-INPUT')
          .map(input => {
            return {
              name: input.name,
              label: input.label
            }
          })
      ]
      .reduce((userFieldsWithoutDuplicates, userField) => {
        return !userFieldsWithoutDuplicates.find(checkIt => checkIt.name === userField)
          ? [...userFieldsWithoutDuplicates, userField]
          : userFields
      }, [])
    }, [])
    */
    const devices = await this.groupDevicesService.list(this.groupId)
    const countsByVersion = devices
      .reduce((countsByVersion, device) => {
        countsByVersion[device.version] = countsByVersion[device.version]
          ? countsByVersion[device.version]++
          : 1
        return countsByVersion
      }, {})
    this.versionStats = Object.keys(countsByVersion)
      .reduce((versionStats, versionId) => {
        return [
          ...versionStats,
          {
            id: versionId,
            percentage: countsByVersion[versionId] / devices.length
          }
        ]
      }, [])
    this.deviceInfos = devices
      .sort(function (a, b) {
        return !a.registeredOn ? -1 : !b.registeredOn ? 1 : b.registeredOn - a.registeredOn;
      })
      .filter(device => {
        return this.locationFilter
          .filter(node => !!node.value)
          .reduce((matchesAll, node) => {
            return device.assignedLocation.value.find(n => n.level === node.level) && device.assignedLocation.value.find(n => n.level === node.level).value === node.value
              ? true
              : false
          }, true)
      })
      .map(device => {
      return <DeviceInfo>{
        ...device,
        registeredOn: device.registeredOn ? moment(device.registeredOn).format('YYYY-MM-DD hh:mm a') : '',
        syncedOn: device.syncedOn ? moment(device.syncedOn).format('YYYY-MM-DD hh:mm a') : '',
        updatedOn: device.updatedOn ? moment(device.updatedOn).format('YYYY-MM-DD hh:mm a') : '',
        assignedLocation: device.assignedLocation.value ? device.assignedLocation.value.map(value => `<b>${value.level}</b>: ${this.flatLocationList.locations.find(node => node.id === value.value).label}`).join('<br>') : '',
        syncLocations: device.syncLocations.map(syncLocation => {
          return syncLocation.value.map(value => `<b>${value.level}</b>: ${this.flatLocationList.locations.find(node => node.id === value.value).label}`).join('<br>')
        }).join('; ')
      }
    })
  }

  async addDevice() {
    const device = <GroupDevice>await this.groupDevicesService.createDevice(this.groupId)
    this.editDevice(device._id)
  }

  async resetDevice(deviceId:string) {
    const device = await this.groupDevicesService.resetDevice(this.groupId, deviceId)
    this.update()
  }

  async deleteDevice(deviceId:string) {
    const device = await this.groupDevicesService.deleteDevice(this.groupId, deviceId)
    this.update()
  }

  getDeviceRegistrationCode(deviceId:string) {
    const device = this.deviceInfos.find(deviceInfo => deviceInfo._id === deviceId)
    const qr = new qrcode.default(0, 'H')
    qr.addData(`{"id":"${device._id}","token":"${device.token}"}`)
    qr.make()
    window['dialog'].innerHTML = `<div style="width:${Math.round((window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth) *.6)}px" id="qr"></div>`
    window['dialog'].open()
    window['dialog'].querySelector('#qr').innerHTML = qr.createSvgTag({cellSize:500, margin:0,cellColor:(c, r) =>''})
  }

  async editDevice(deviceId:string) {
    const locationList = <any>await this.httpClient.get('./assets/location-list.json').toPromise()
    const device = await this.groupDevicesService.getDevice(this.groupId, deviceId)
    window['dialog'].innerHTML = `
    <paper-dialog-scrollable>
      <tangy-form>
        <tangy-form-item id="edit-device" on-change="
          const selectedSLshowLevels = inputs.sync_location__show_levels.value.slice(0, inputs.sync_location__show_levels.value.findIndex(option => option.value === 'on')+1).map(option => option.name).join(',')
          inputs.sync_location.setAttribute('show-levels',selectedSLshowLevels)
        ">
          <tangy-input name="_id" label="ID" value="${device._id}" disabled></tangy-input>
          <tangy-input name="token" label="Token" value="${device.token}" disabled></tangy-input>
          <tangy-checkbox name="claimed" label="Claimed" value="${device.claimed ? 'on' : ''}" disabled></tangy-checkbox>
          <tangy-location
            ${device.claimed ? `disabled` : ''}
            required
            name="assigned_location"
            label="Assign device to location at which location?"
            show-levels='${locationList.locationsLevels.join(',')}'
            ${device.assignedLocation && device.assignedLocation.value ? `
              value='${JSON.stringify(device.assignedLocation.value)}'
            ` : ''}
          >
          </tangy-location>
          <tangy-radio-buttons
            ${device.claimed ? `disabled` : ''}
            required
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
            ${device.claimed ? `disabled` : ''}
            required
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
    </paper-dialog-scrollable>
    `
    window['dialog'].querySelector('tangy-form').addEventListener('submit', async (event) => {
      device.assignedLocation.value = event.target.inputs.find(input => input.name === 'assigned_location').value
      device.assignedLocation.showLevels = event.target.inputs.find(input => input.name === 'assigned_location').showLevels.split(',')
      device.syncLocations[0] = {
        value: event.target.inputs.find(input => input.name === 'sync_location').value,
        showLevels: event.target.inputs.find(input => input.name === 'sync_location').showLevels.split(',')
      }
      await this.groupDevicesService.updateDevice(this.groupId, device)
      this.update()
      window['dialog'].close()
    })
    setTimeout(() => window['dialog'].open(), 450)

  }

  async generateDevices() {
    const locationList = <any>await this.httpClient.get('./assets/location-list.json').toPromise()
    window['dialog'].innerHTML = `
    <paper-dialog-scrollable>
      <tangy-form>
        <tangy-form-item id="edit-device" on-change="
        ">
          <tangy-input name="number_of_devices" label="Number of devices to generate" type="number" required></tangy-input>
          <tangy-location
            required
            name="assigned_location"
            label="Assign devices which location?"
            show-levels='${locationList.locationsLevels.join(',')}'
          >
          </tangy-location>
          <tangy-radio-buttons
            required
            label="Sync device to location at which level?"
            name="sync_location__show_levels"
          >
            ${locationList.locationsLevels.map(level => `
              <option value="${level}">${level}</option>
            `).join('')}
          </tangy-radio-buttons>
        </tangy-form-item>
      </tangy-form>
    </paper-dialog-scrollable>
    `
    window['dialog'].querySelector('tangy-form').addEventListener('submit', async (event) => {
      const numberOfDevicesToGenerate = parseInt(event.target.inputs.find(input => input.name === 'number_of_devices').value) 
      debugger
      const assignedLevels = event.target.inputs.find(input => input.name === 'assigned_location').showLevels.split(',')
      const assignedLocationNodes = event.target.inputs.find(input => input.name === 'assigned_location').value
      const syncLevels = event.target.inputs
        .find(input => input.name === 'sync_location__show_levels')
        .value
        .slice(
          0,
          event.target.inputs
            .find(input => input.name === 'sync_location__show_levels')
            .value
            .findIndex(option => option.value === 'on')+1
        )
        .map(option => option.name)
      const syncLocationNodes = event.target.inputs.find(input => input.name === 'assigned_location').value
        .filter(node => syncLevels.includes(node.level))
      let numberOfDevicesGenerated = 0
      window['dialog'].innerHTML = `<h1>Generating Devices...</h1>`
      while (numberOfDevicesGenerated < numberOfDevicesToGenerate) {
        const device = await this.groupDevicesService.createDevice(this.groupId)
        device.assignedLocation.value = assignedLocationNodes
        device.assignedLocation.showLevels = assignedLevels 
        device.syncLocations[0] = {
          value: syncLocationNodes,
          showLevels: syncLevels
        }
        await this.groupDevicesService.updateDevice(this.groupId, device)
        numberOfDevicesGenerated++
      }
      this.update()
      window['dialog'].close()
    })
    setTimeout(() => window['dialog'].open(), 450)

  }
}
