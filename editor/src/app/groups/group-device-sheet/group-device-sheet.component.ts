import {Component, Input, OnInit} from '@angular/core';
import {_TRANSLATE} from "../../shared/_services/translation-marker";
import {GroupDevicesService} from "../services/group-devices.service";
import {ActivatedRoute} from "@angular/router";
import {GroupsService} from "../services/groups.service";
import {HttpClient} from "@angular/common/http";
import { Loc } from 'tangy-form/util/loc.js';
import * as qrcode from 'qrcode-generator-es6';
import * as moment from 'moment'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface LocationNode {
  level:string
  value:string
}

interface VersionStat {
  id:string
  percentage:number
}
interface DeviceInfo {
  group:string
  qrSvg:SafeHtml
  desc:string
}
@Component({
  selector: 'app-group-device-sheet',
  templateUrl: './group-device-sheet.component.html',
  styleUrls: ['./group-device-sheet.component.css']
})
export class GroupDeviceSheetComponent implements OnInit {

  title = _TRANSLATE("Devices")
  deviceInfos:Array<DeviceInfo> = []
  versionStats:Array<VersionStat>
  flatLocationList
  locationFilter:Array<LocationNode> = []
  devicesDisplayedColumns = ['desc', 'qr-code']
  tableArray = []
  group:any

  @Input('groupId') groupId:string
  noUnclaimedDevices: boolean = false

  constructor(
    private route: ActivatedRoute,
    private httpClient:HttpClient,
    private groupsService:GroupsService,
    private groupDevicesService:GroupDevicesService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.groupId = params.groupId
      this.group = await this.groupsService.getGroupInfo(params.groupId)
      //this.menuService.setContext(group.label, 'Deploy', 'deploy', group._id)
      const locationList = await this.httpClient.get('./assets/location-list.json').toPromise()
      this.flatLocationList = Loc.flatten(locationList)
      //this.locationEl.nativeElement.addEventListener('change', (event) => this.onLocationSelection(event.target.value))
      await this.listDevices()
    })
  }

  async listDevices() {
    const devices = (await this.groupDevicesService.list(this.groupId)).filter(device => !device.claimed)
    if (devices.length ===0) {
      this.noUnclaimedDevices = true
    }
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
        const qr = new qrcode.default(0, 'H')
        qr.addData(`{"id":"${device._id}","token":"${device.token}"}`)
        qr.make()
        const qrCode = qr.createSvgTag({cellSize:500, margin:0,cellColor:(c, r) =>''})
        let svg:SafeHtml;
        svg = this.sanitizer.bypassSecurityTrustHtml(qrCode);
        const loc =  device.assignedLocation.value ? device.assignedLocation.value.map(value => `<b>${value.level}</b>: ${this.flatLocationList.locations.find(node => node.id === value.value).label}`).join('<br>') : ''
        const description = `<p>${this.group.label}</p><p>${device._id.substr(0,6)}</p><p>${loc}</p>`
        return <DeviceInfo>{
          ...device,
          group: this.group.name,
          desc: description,
          qrSvg: svg
        }
      })
    let currentDeviceInfoArray:Array<DeviceInfo> = []
    if (this.deviceInfos.length > 0 && this.deviceInfos.length < 4) {
      this.tableArray.push(this.deviceInfos)
    } else {
      this.deviceInfos.forEach((deviceInfo, index) => {
        if ((index+1) % 3 === 0) {
          currentDeviceInfoArray.push(deviceInfo)
          this.tableArray.push(currentDeviceInfoArray)
          currentDeviceInfoArray = []
        } else {
          currentDeviceInfoArray.push(deviceInfo)
          if ((index+1) == this.deviceInfos.length) {
            this.tableArray.push(currentDeviceInfoArray)
          }
        }
      })
    }
    // console.log("tableArray: " + JSON.stringify(this.tableArray))
  }



}
