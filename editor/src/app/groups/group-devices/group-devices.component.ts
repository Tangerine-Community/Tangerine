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
import * as XLSX from "xlsx";
import { UAParser } from 'ua-parser-js';

const template__calculateDownSyncSizeFunction = `
  window.calculateDownSyncSize = async function() {
    const locationIds = Object.keys(inputs).reduce((locationIds, variableName) => {
      return inputs[variableName].tagName === 'TANGY-LOCATION' && 
        variableName.includes('sync_location') &&
        inputs[variableName].value &&
        inputs[variableName].value.length > 0
          ? [...locationIds, inputs[variableName].value[inputs[variableName].value.length - 1].value]
          : locationIds
    }, [])
    let totalNumberOfDownSyncDocs = 0
    for (let locationId of locationIds) {
      const numberOfDownSyncDocsForLocation = parseInt(await (await fetch('downSyncDocCountByLocationId/' + locationId)).text())
      totalNumberOfDownSyncDocs += numberOfDownSyncDocsForLocation
    }
    alert('Estimated total number of docs to sync down is ' + totalNumberOfDownSyncDocs.toString() + '.')
  }
`

const template__calculateDownSyncSizeButton = `
  <paper-button onclick="window.calculateDownSyncSize()" style="background: #f26f10; color: #FFF">Calculate down-sync size</paper-button>
`


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
  duration:string
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
  storageAvailableErrorThreshhold = 1
  breadcrumbs:Array<Breadcrumb> = []
  devices:Array<GroupDevice>
  users:Array<TangyFormResponseModel> = []
  deviceInfos:Array<DeviceInfo> = []
  userFields:Array<UserField>
  versionStats:Array<VersionStat>
  flatLocationList
  locationFilter:Array<LocationNode> = []
  tab = 'TAB_USERS'
  devicesDisplayedColumns = ['id', 'description', 'assigned-location', 'sync-location', 'claimed', 'registeredOn', 'syncedOn', 'updatedOn', 'version', 'tagVersion', 'tangerineVersion', 'encryptionLevel', 'errorMessage', 'dbDocCount',  'localDocsForLocation', 'storageAvailable', 'network', 'os', 'browserVersion', 'star']

  @Input('groupId') groupId:string
  @ViewChild('dialog', {static: true}) dialog: ElementRef;
  @ViewChild('locationEl', {static: true}) locationEl: ElementRef;
  isExporting: boolean;
  displayLowStorageWarning: boolean

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
        let replicationStatus
        // TODO - remove this deprecated persisted code/property
        if (device.replicationStatus) {
          replicationStatus = device.replicationStatus
        }
        if (device.replicationStatuses?.length > 0) {
          replicationStatus = device.replicationStatuses[device.replicationStatuses.length - 1]
          device.replicationStatus = replicationStatus
        }
        let errorFlag = false
        if (replicationStatus?.info?.errors?.length > 0) {
          errorFlag = true
        }
        if (replicationStatus?.pullError) {
          errorFlag = true
        }
        if (replicationStatus?.pushError) {
          errorFlag = true
        }
        // const durationUTC = moment.utc(duration).format('HH:mm:ss')

        let duration = replicationStatus?.syncCouchdbServiceDuration ? moment.utc(replicationStatus?.syncCouchdbServiceDuration).format('HH:mm:ss') :
          replicationStatus?.info ? moment.utc(moment.duration(moment(replicationStatus?.info?.end_time).diff(moment(replicationStatus?.info?.start_time))).as('milliseconds')).format('HH:mm:ss') : ''
        // if it is a compareSync instead of a normal syncCouchdbService sync.
        duration = replicationStatus?.compareSyncDuration ? moment.utc(replicationStatus?.compareSyncDuration).format('HH:mm:ss') : duration
        const versionTag = replicationStatus?.deviceInfo?.versionTag
        const tangerineVersion = replicationStatus?.deviceInfo?.tangerineVersion
        const encryptionLevel = replicationStatus?.deviceInfo?.encryptionLevel
        const dbDocCount = replicationStatus?.dbDocCount
        const localDocsForLocation = replicationStatus?.localDocsForLocation
        const storageAvailable = replicationStatus?.storageAvailable ? (replicationStatus?.storageAvailable / (1024*1024)).toFixed(2) : ""
        
        const effectiveConnectionType = replicationStatus?.effectiveConnectionType
        let os, osName, osVersion, browserVersion, isStorageThresholdExceeded
        if (replicationStatus?.storageAvailable && (replicationStatus?.storageAvailable / (1024*1024)) < this.storageAvailableErrorThreshhold) {
          isStorageThresholdExceeded = true
          this.displayLowStorageWarning = true
        }
        // There are some old clients that may not have replicationStatus; parser.setUA crashes if you send it null.
        if (replicationStatus?.userAgent) {
          const parser = new UAParser();
          parser.setUA(replicationStatus?.userAgent)
          os = parser?.getOS()
          osName = parser?.getOS()?.name
          osVersion = parser?.getOS()?.version
          browserVersion = parser?.getBrowser().version
        }
        // Sometimes the locations change, and the location on the tab no longer shows up on the list
        let assignedLocation, syncLocations
        try {
          assignedLocation = device.assignedLocation.value.map(value => `<b>${value.level}</b>: ${this.flatLocationList.locations.find(node => node.id === value.value).label}`).join('<br>')
        } catch (e) {
          assignedLocation = "Location lookup error with " + JSON.stringify(device.assignedLocation.value)
          console.log("Cannot coerce assignedLocation for " + JSON.stringify(device.assignedLocation.value))
        }
        try {
          syncLocations = device.syncLocations.map(syncLocation => {
            return syncLocation.value.map(value => `<b>${value.level}</b>: ${this.flatLocationList.locations.find(node => node.id === value.value).label}`).join('<br>')
          }).join('; ')
        } catch (e) {
          syncLocations = "syncLocations lookup error with " + JSON.stringify(device.assignedLocation.value)
          console.log("Cannot coerce syncLocations for " + JSON.stringify(device.syncLocations))
        }
        
        
        const comparisonSyncMessage = replicationStatus?.idsToSyncCount + ' docs synced - ' + replicationStatus?.compareDocsDirection
      return <DeviceInfo>{
        ...device,
        registeredOn: device.registeredOn ? moment(device.registeredOn).format('YYYY-MM-DD hh:mm a') : '',
        syncedOn: device.syncedOn ? moment(device.syncedOn).format('YYYY-MM-DD hh:mm a') : '',
        updatedOn: device.updatedOn ? moment(device.updatedOn).format('YYYY-MM-DD hh:mm a') : '',
        assignedLocation: device.assignedLocation.value ? assignedLocation : '',
        duration: duration,
        versionTag: versionTag,
        tangerineVersion: tangerineVersion,
        encryptionLevel: encryptionLevel,
        dbDocCount: dbDocCount,
        localDocsForLocation: localDocsForLocation,
        storageAvailable: storageAvailable,
        isStorageThresholdExceeded: isStorageThresholdExceeded,
        effectiveConnectionType: effectiveConnectionType,
        errorFlag: errorFlag,
        os: replicationStatus?.userAgent ? os : null,
        osName: replicationStatus?.userAgent ? osName : null,
        osVersion: replicationStatus?.userAgent ? osVersion : null,
        browserVersion: replicationStatus?.userAgent ? browserVersion : null,
        syncLocations: syncLocations,
        comparisonSync: replicationStatus?.compareDocsStartTime ? comparisonSyncMessage : null
      }
    })
  }
  
  async viewSyncLog(deviceId:string) {
    const device = await this.groupDevicesService.getDevice(this.groupId, deviceId)
    if (device.replicationStatus) {
      window['dialog'].innerHTML = `
    <paper-dialog-scrollable>
      ${JSON.stringify(device.replicationStatus)}
    </paper-dialog-scrollable>
    `
    } else if (device.replicationStatuses) {
      const replicationStatusesReversed = device.replicationStatuses.reverse()
      let output = '<h2>Sync Log</h2>\n<p>Sync Property Notes: ' +
        '<ul>' +
        '<li>fullSync: Indicates the direction of a rewind sync. Disregard the `direction` property: even if fullSync = push, ' +
        'the `direction` property changes from push to pull because it does both a push and a pull. </li>' +
        '<li>compareDocsStartTime: Indicates a comparison sync. The compareDocsDirection property indicates the direction. </li>' +
        '</ul>\n' +
        '<style>.syncLog td {\n' +
        '  vertical-align: top;\n  display: inline-block; margin-bottom: 5px;\n' +
        '}</style><table class="syncLog">';
      replicationStatusesReversed.forEach(status => {
        output = output + "<tr><td><strong>" + moment(status.syncCouchdbServiceEndime).format("YYYY-MM-DD HH:mm:SS") + "</strong></td></tr><tr><td><pre>" + JSON.stringify(status, null, 2) + "</pre></td></tr>"
      })
      output = output + "</table>"
      window['dialog'].innerHTML = `
    <paper-dialog-scrollable>
      ${output}
    </paper-dialog-scrollable>
    `
    } else {
      window['dialog'].innerHTML = `
    <paper-dialog-scrollable>
      Replication status not available.
    </paper-dialog-scrollable>
    `
    }
    
    setTimeout(() => window['dialog'].open(), 450)
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
    const maxSyncLocations = 20
    const syncLocations = []
    let i = 0
    while (i < maxSyncLocations) {
      syncLocations.push(device.syncLocations[i]
        ? device.syncLocations[i]
        : null
      )
      i++
    }
    window['dialog'].innerHTML = `
      <paper-dialog-scrollable>
        <h2>Device Settings</h2>
        <tangy-form>
          <tangy-form-item id="edit-device" 
            on-open="
              ${template__calculateDownSyncSizeFunction}
            "
            on-change="
              const locationsLevels = [ ${locationList.locationsLevels.map(level => `'${level}'`).join(',')} ]
              ${syncLocations.map((syncLocation, i) => `
                if (getValue('sync_location__show_levels__${i}')) {
                  inputs.sync_location__${i}.setAttribute('show-levels', locationsLevels.slice(0, locationsLevels.indexOf(getValue('sync_location__show_levels__${i}'))+1).join(','))
                }
              `).join('')}
            "
          >
            <style>
              .device-settings-list {
                vertical-align: top;
                font-size: larger;
                font-weight: bold ;
              }
              .device-settings-list-element {
                vertical-align: top;
                padding-top: 40px;
              }
              table {
                  margin-left: 1em;
              }
            </style>
            <table>
              <tr><td class="device-settings-list">ID</td><td>${device._id}</td></tr>
              <tr><td class="device-settings-list">Token</td><td>${device.token}</td></tr>
              <tr><td class="device-settings-list">Claimed</td><td>${device.claimed ? 'Yes' : 'No'}</td></tr>
            </table>
            <tangy-input name="description" label="Device description" value="${device.description ? device.description : ''}"></tangy-input>
            <tangy-checkbox 
              name="reconfigure_assigned_location"
              label="Reconfigure assigned location"
              hint-text="Warning: Reconfiguring assigned location will not take affect on the Device until this Device record is Reset and then the app is reinstalled on the Tablet."
            >
            </tangy-checkbox>
            <tangy-location
              name="assigned_location"
              label="Assign device to location at which location?"
              hint-text="This determines the default location metadata for syncing that is applied to a new Case. Your forms may reassign a Case, see change-location-of-case form in the case-module content set for an example."
              disable-if="!getValue('reconfigure_assigned_location')"
              show-levels='${locationList.locationsLevels.join(',')}'
              ${device.assignedLocation && device.assignedLocation.value ? `
                value='${JSON.stringify(device.assignedLocation.value)}'
              ` : ''}
            >
            </tangy-location>
            <tangy-checkbox 
              name="reconfigure_sync"
              label="Reconfigure sync"
              hint-text="Warning: Reconfiguring sync will result in the device deleting all of its data and downloading everything given the new sync settings."
            >
            </tangy-checkbox>
            <tangy-select
              name="number_of_sync_locations"
              label="Number of locations to sync to"
              disable-if="!getValue('reconfigure_sync')"
              value="${device.syncLocations.length ? device.syncLocations.length : 0}"
            >
              ${syncLocations.map((syncLocation, i) => `
                <option value=${i+1}>${i+1}</option>
              `).join('')}
            </tangy-select>
            ${syncLocations.map((syncLocation, i) => `
              <tangy-box
                name="sync_location__title__${i}"
                disable-if="!getValue('reconfigure_sync')"
                show-if="parseInt(getValue('number_of_sync_locations'))-1 >= ${i}"
              >
                <h2 style="padding: 0px; margin: 0px;">Sync Location ${i+1}</h2>
              </tangy-box>
              <tangy-radio-buttons
                label="Sync device to location at which level?"
                name="sync_location__show_levels__${i}"
                disable-if="!getValue('reconfigure_sync')"
                show-if="parseInt(getValue('number_of_sync_locations'))-1 >= ${i}"
                ${syncLocations && syncLocations[i] && syncLocations[i].showLevels ? `
                  value='${
                    JSON.stringify(
                      locationList.locationsLevels.map(level => {
                        return {
                          name: level,
                          value: level === syncLocations[i].showLevels.slice(-1)[0] ? 'on' : ''
                        }
                      })
                    )
                  }'
                ` : ''}
              >
                ${locationList.locationsLevels.map(level => `
                  <option value="${level}">${level}</option>
                `).join('')}
              </tangy-radio-buttons>
              <tangy-location
                disable-if="!getValue('reconfigure_sync')"
                name="sync_location__${i}"
                show-if="parseInt(getValue('number_of_sync_locations'))-1 >= ${i}"
                label="Sync device to which location?"
                ${syncLocations && syncLocations[i] && syncLocations[i].value ? `
                  show-levels='${syncLocations[i].showLevels.join(',')}'
                  value='${JSON.stringify(syncLocations[i].value)}'
                ` : ''}
              >
              </tangy-location>
            `).join('')}
            ${template__calculateDownSyncSizeButton}
          </tangy-form-item>
        </tangy-form>
      </paper-dialog-scrollable>
    `
    window['dialog'].querySelector('tangy-form').addEventListener('submit', async (event) => {
      const inputs = event.target.inputs
      device.description = inputs.find(input => input.name === 'description').value
      device.assignedLocation = {
        showLevels: inputs.find(input => input.name === 'assigned_location').showLevels.split(','),
        value: inputs.find(input => input.name === 'assigned_location').value,
      }
      const numberOfSyncLocations = parseInt(inputs.find(input => input.name === 'number_of_sync_locations').value)
      let i = 0
      const syncLocations = []
      while (i < numberOfSyncLocations) {
        syncLocations.push(
          {
            showLevels: inputs.find(input => input.name === `sync_location__${i}`).showLevels.split(','),
            value: inputs.find(input => input.name === `sync_location__${i}`).value,
          }
        )
        i++
      }
      device.syncLocations = syncLocations
      await this.groupDevicesService.updateDevice(this.groupId, device)
      this.update()
      window['dialog'].close()
    })
    setTimeout(() => window['dialog'].open(), 450)

  }

  async generateDevices() {
    const locationList = <any>await this.httpClient.get('./assets/location-list.json').toPromise()
    const maxSyncLocations = 20
    // Set up an array of blank syncLocations for the template to iterate over.
    const syncLocations = []
    let i = 0
    while (i < maxSyncLocations) {
      syncLocations.push(null)
      i++
    }
    window['dialog'].innerHTML = `
    <paper-dialog-scrollable>
      <tangy-form>
        <tangy-form-item id="edit-device" 
        on-open="
          ${template__calculateDownSyncSizeFunction}
        "
        on-change="
          const locationsLevels = [ ${locationList.locationsLevels.map(level => `'${level}'`).join(',')} ]
          ${syncLocations.map((syncLocation, i) => `
            if (getValue('sync_location__show_levels__${i}')) {
              inputs.sync_location__${i}.setAttribute('show-levels', locationsLevels.slice(0, locationsLevels.indexOf(getValue('sync_location__show_levels__${i}'))+1).join(','))
            }
          `).join('')}
        ">
          <style>
            .device-settings-list {
              vertical-align: top;
              font-size: larger;
              font-weight: bold ;
            }
            .device-settings-list-element {
              vertical-align: top;
              padding-top: 40px;
            }
            table {
                margin-left: 1em;
            }
          </style>
          <tangy-input name="number_of_devices" value="1" label="Number of devices to generate" type="number" required></tangy-input>
          <tangy-input name="description" label="Device description"></tangy-input>
          <tangy-location
            name="assigned_location"
            label="Assign device to location at which location?"
            hint-text="This determines the default location metadata for syncing that is applied to a new Case. Your forms may reassign a Case, see change-location-of-case form in the case-module content set for an example."
            show-levels='${locationList.locationsLevels.join(',')}'
          >
          </tangy-location>
          <tangy-select
            name="number_of_sync_locations"
            label="Number of locations to sync to"
            value="1"
          >
            ${syncLocations.map((syncLocation, i) => `
              <option value=${i+1}>${i+1}</option>
            `).join('')}
          </tangy-select>
          ${syncLocations.map((syncLocation, i) => `
            <tangy-box
              name="sync_location__title__${i}"
              show-if="parseInt(getValue('number_of_sync_locations'))-1 >= ${i}"
            >
              <h2 style="padding: 0px; margin: 0px;">Sync Location ${i+1}</h2>
            </tangy-box>
            <tangy-radio-buttons
              label="Sync device to location at which level?"
              name="sync_location__show_levels__${i}"
              show-if="parseInt(getValue('number_of_sync_locations'))-1 >= ${i}"
              ${syncLocations && syncLocations[i] && syncLocations[i].showLevels ? `
                value='${
                  JSON.stringify(
                    locationList.locationsLevels.map(level => {
                      return {
                        name:level,value:level === syncLocations[i].showLevels.slice(-1)[0] ? 'on' : ''
                      }
                    })
                  )
                }'
              ` : ''}
            >
              ${locationList.locationsLevels.map(level => `
                <option value="${level}">${level}</option>
              `).join('')}
            </tangy-radio-buttons>
            <tangy-location
              name="sync_location__${i}"
              show-if="parseInt(getValue('number_of_sync_locations'))-1 >= ${i}"
              label="Sync device to which location?"
              ${syncLocations && syncLocations[i] && syncLocations[i].value ? `
                show-levels='${syncLocations[i].showLevels.join(',')}'
                value='${JSON.stringify(syncLocations[i].value)}'
              ` : ''}
            >
            </tangy-location>
          `).join('')}
          ${template__calculateDownSyncSizeButton}
        </tangy-form-item>
      </tangy-form>
    </paper-dialog-scrollable>
    `
    window['dialog'].querySelector('tangy-form').addEventListener('submit', async (event) => {
      const numberOfDevicesToGenerate = parseInt(event.target.inputs.find(input => input.name === 'number_of_devices').value) 
      const assignedLevels = event.target.inputs.find(input => input.name === 'assigned_location').showLevels.split(',')
      const assignedLocationNodes = event.target.inputs.find(input => input.name === 'assigned_location').value
      const description = event.target.inputs.find(input => input.name === 'description').value
      const numberOfSyncLocations = parseInt(event.target.inputs.find(input => input.name === 'number_of_sync_locations').value)
      let i = 0
      const syncLocations = []
      while (i < numberOfSyncLocations) {
        syncLocations.push(
          {
            showLevels: event.target.inputs.find(input => input.name === `sync_location__${i}`).showLevels.split(','),
            value: event.target.inputs.find(input => input.name === `sync_location__${i}`).value,
          }
        )
        i++
      }
      let numberOfDevicesGenerated = 0
      window['dialog'].innerHTML = `<h1>Generating Devices...</h1>`
      while (numberOfDevicesGenerated < numberOfDevicesToGenerate) {
        const device = await this.groupDevicesService.createDevice(this.groupId)
        device.assignedLocation.value = assignedLocationNodes
        device.assignedLocation.showLevels = assignedLevels 
        device.syncLocations = syncLocations 
        device.description = description
        await this.groupDevicesService.updateDevice(this.groupId, device)
        numberOfDevicesGenerated++
      }
      this.update()
      window['dialog'].close()
    })
    setTimeout(() => window['dialog'].open(), 450)

  }

  async export() {
    this.isExporting = true;
    const worksheet = XLSX.utils.json_to_sheet(this.deviceInfos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'devices');
    XLSX.writeFile(workbook, 'devices.xlsx');
    this.isExporting = false;
  }
}
