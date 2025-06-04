import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { VariableService } from './../../shared/_services/variable.service';
import { LockBoxService } from './../../shared/_services/lock-box.service';
import { Loc } from 'tangy-form/util/loc.js';
import { Device, LocationConfig } from './../classes/device.class';
import { AppConfigService } from './../../shared/_services/app-config.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {AppConfig} from '../../shared/_classes/app-config.class';
import {ReplicationStatus} from "../../sync/classes/replication-status.class";
import {UserService} from "../../shared/_services/user.service";
const bcrypt = window['dcodeIO'].bcrypt

export interface AppInfo {
  encryptionLevel:string
  serverUrl:string
  groupName:string
  deviceId:string
  groupId:string
  buildChannel:string
  tangerineVersion:string
  buildId:string
  assignedLocation:LocationConfig
  syncLocation:LocationConfig
  versionTag:string
  curriculum: string[];
  grades:[];
  school: any;

}

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  device:Device
  username:string
  password:string
  rawBuildChannel:string
  buildId:string
  tangerineVersion:string
  versionTag:string
  appInfo:AppInfo

  constructor(
    private httpClient:HttpClient,
    private variableService:VariableService,
    private lockBoxService:LockBoxService,
    private appConfigService:AppConfigService
  ) {
  }

  async install() {
    // ?
  }

  async initialize() {
    let grade, curriculum, grades, school, assignedLocationString, syncLocation:LocationConfig;
    const appConfig = await this.appConfigService.getAppConfig()
    const homeUrl = appConfig.homeUrl;
    const buildId = window.location.hostname !== 'localhost' ? await this.getBuildId() : 'localhost'
    const buildChannel = window.location.hostname !== 'localhost' ? await this.getBuildChannel() : 'localhost'
    const device = await this.getDevice()
    const locationList = await this.appConfigService.getLocationList();
    const flatLocationList = Loc.flatten(locationList)

    const encryptionLevel = (window['isCordovaApp'] && window['sqlCipherRunning'])
      ? _TRANSLATE('in-app')
      : 'OS'
    const assignedLocation:LocationConfig = device.assignedLocation
    const syncLocations:LocationConfig[] = device.syncLocations
    try {
      assignedLocationString = device && device.assignedLocation && device.assignedLocation.value && Array.isArray(device.assignedLocation.value)
        ? device.assignedLocation.value.map(value => ` ${value.level}: ${flatLocationList.locations.find(node => node.id === value.value).label}`).join(', ')
        : 'N/A'
    } catch (e) {
      // This may be a restored backup in an APK with a different app-config.json. Use the device's assignedLocation.
      assignedLocationString = device && device.assignedLocation && device.assignedLocation.value && Array.isArray(device.assignedLocation.value)
        ? device.assignedLocation.value.map(value => ` ${value.level}: Restored-${value.value}`).join(', ')
        : 'N/A'
    }

    if (homeUrl == 'dashboard' && assignedLocationString != 'N/A') {
      console.log("populating grade, grades, and curriculum for homeUrl: ", homeUrl)
      const gradeLevel = device.assignedLocation.value.find(loc => loc.level === 'grade');
      if (gradeLevel) {
        grade = gradeLevel.value;
      }
      if (grade) {
        const location = flatLocationList.locations.find(node => node.id === grade)
        if (location) {
          curriculum = location.forms;
        }
        const parentId = location.parent;
        school = flatLocationList.locations.find(node => node.id === parentId)
        grades = flatLocationList.locations.filter(node => node.parent === parentId)
      }
      syncLocation = device.syncLocations[0] || device.assignedLocation;
    }
    
    const tangerineVersion = window.location.hostname !== 'localhost' ? await this.getTangerineVersion() : 'localhost'
    const versionTag = window.location.hostname !== 'localhost' ? await this.getVersionTag() : 'localhost'
    this.appInfo = <AppInfo>{
      serverUrl: appConfig.serverUrl,
      groupName: appConfig.groupName,
      groupId: appConfig.groupId,
      encryptionLevel,
      tangerineVersion,
      buildChannel,
      buildId,
      deviceId: device._id,
      assignedLocation,
      versionTag,
      curriculum,
      grades,
      school,
      syncLocation
    }
  }

  async getRemoteDeviceInfo(id, token):Promise<Device> {
    const appConfig = await this.appConfigService.getAppConfig()
    const device = <Device>await this
      .httpClient
      .get(`${appConfig.serverUrl}group-device-public/read/${appConfig.groupId}/${id}/${token}`).toPromise()
    return device
  }

  async register(id, token, isTest = false):Promise<Device> {
    const appConfig = await this.appConfigService.getAppConfig()
    const homeUrl = appConfig.homeUrl
    let device:Device
    if (isTest) {
      device = await this.generateTestDevice(id, token, homeUrl);
    } else {
      device = <Device>await this
        .httpClient
        .get(`${appConfig.serverUrl}group-device-public/register/${appConfig.groupId}/${id}/${token}`).toPromise()
    }
    await this.variableService.set('tangerine-device-is-registered', true)
    return device
  }

  async isRegistered() {
    return await this.variableService.get('tangerine-device-is-registered')
  }

  async getDevice():Promise<Device> {
    try {
      if (window.location.hostname === 'localhost') {
        const appConfig = await this.appConfigService.getAppConfig()
        const homeUrl = appConfig.homeUrl
        const device = await this.generateTestDevice('device1', 'token1', homeUrl);
        return device;
      }
      const locker = this.lockBoxService.getOpenLockBox()
      this.device = locker.contents.device
      return this.device 
    } catch (e) {
      return new Device()
    }
  }

  async didUpdate(deviceId = '', deviceToken = '', status:ReplicationStatus):Promise<any> {
    const appConfig = await this.appConfigService.getAppConfig()
    const version = await this.getBuildId()
    if (!deviceId || !deviceToken) {
      const device = await this.getDevice()
      deviceId = device._id
      deviceToken = device.token
    }
    
    // await this
    //   .httpClient
    //   .get(`${appConfig.serverUrl}group-device-public/did-update/${appConfig.groupId}/${deviceId}/${deviceToken}/${version}`).toPromise()
    console.log("Sending sync status with update.")
    await this
      .httpClient
      .post(`${appConfig.serverUrl}group-device-public/did-update-status/${appConfig.groupId}/${deviceId}/${deviceToken}/${version}`, {
        status: status
      }).toPromise()
    
  }

  async didSync(status):Promise<any> {
    const appConfig = await this.appConfigService.getAppConfig()
    const device = await this.getDevice()
    const version = await this.getBuildId()
    if (status) {
      console.log("Sending sync status.")
      await this
        .httpClient
        .post(`${appConfig.serverUrl}group-device-public/did-sync-status/${appConfig.groupId}/${device._id}/${device.token}/${version}`, {
            status: status
          }).toPromise()
    } else {
      await this
        .httpClient
        .get(`${appConfig.serverUrl}group-device-public/did-sync/${appConfig.groupId}/${device._id}/${device.token}/${version}`).toPromise()
    }
    
  }

  async didSyncError(error):Promise<any> {
    const appConfig = await this.appConfigService.getAppConfig()
    const device = await this.getDevice()
    const version = await this.getBuildId()
    await this
      .httpClient
      .get(`${appConfig.serverUrl}group-device-public/did-sync-error/${appConfig.groupId}/${device._id}/${device.token}/${version}/${error}`).toPromise()
  }

  getAppInfo() {
    return this.appInfo
  }

  async getTangerineVersion() {
    try {
      this.tangerineVersion = this.tangerineVersion ? this.tangerineVersion : await this.httpClient.get('./assets/tangerine-version', {responseType: 'text'}).toPromise();
      return this.tangerineVersion.replace(/\n$/, '');
    } catch (e) {
      return 'N/A';
    }
  }

  async getBuildId() {
    try {
      this.buildId = this.buildId ? this.buildId : await this.httpClient.get('./assets/tangerine-build-id', {responseType: 'text'}).toPromise();
      return this.buildId.replace(/\n$/, '');
    } catch (e) {
      return 'N/A';
    }
  }

  async getBuildChannel() {
    try {
      this.rawBuildChannel = this.rawBuildChannel ? this.rawBuildChannel : await this.httpClient.get('./assets/tangerine-build-channel', {responseType: 'text'}).toPromise()
      return this.rawBuildChannel.includes('prod')
        ? 'live'
        : this.rawBuildChannel.includes('qa')
          ? 'test'
          : 'unknown'
    } catch (e) {
      return 'N/A'
    }
  }

  async getVersionTag() {
    try {
      this.versionTag = this.versionTag ? this.versionTag : await this.httpClient.get('./assets/tangerine-version-tag', {responseType: 'text'}).toPromise()
      return this.versionTag.replace(/\n$/, '');
    } catch (e) {
      return 'N/A'
    }
  }

  /**
   * 
   * @param id 
   * @param token 
   * @param homeUrl 
   * @returns Device object with a pickedLocation.
   */
  async generateTestDevice(id, token, homeUrl): Promise<Device> {
    let device: Device, pickedLocation
    // Pick a location out of the location list.
    const locationList = await this.appConfigService.getLocationList()
    const flatLocationList = Loc.flatten(locationList)
    if (homeUrl === 'dashboard') {
      // If the homeUrl is 'dashboard', pick a location that has a grade and curriculum.
      const dashboardLocations = flatLocationList.locations.filter(node => node.level === 'grade' && node.forms && node.forms.length > 0)
      pickedLocation = [...flatLocationList.locationsLevels]
        // Pick any first node at the bottom of the tree, work our way up into an array of location nodes.
        .reverse()
        .reduce((dashboardLocations, level, i) => {
          return [
            i === 0
              ? flatLocationList.locations.find(node => node.level === level)
              : flatLocationList.locations.find(node => node.id === dashboardLocations[0].parent),
            ...dashboardLocations
          ]
        }, [])
      if (!pickedLocation) {
        console.log("No location found with a grade and curriculum. Picking any first node at the bottom of the tree.")
        pickedLocation = [...flatLocationList.locationsLevels]
        // Pick any first node at the bottom of the tree, work our way up into an array of location nodes.
        .reverse()
        .reduce((locationArray, level, i) => {
          return [
            i === 0
              ? flatLocationList.locations.find(node => node.level === level)
              : flatLocationList.locations.find(node => node.id === locationArray[0].parent),
            ...locationArray
          ]
        }, [])
      }
    } else {
      pickedLocation = [...flatLocationList.locationsLevels]
      // Pick any first node at the bottom of the tree, work our way up into an array of location nodes.
      .reverse()
      .reduce((locationArray, level, i) => {
        return [
          i === 0
            ? flatLocationList.locations.find(node => node.level === level)
            : flatLocationList.locations.find(node => node.id === locationArray[0].parent),
          ...locationArray
        ]
      }, [])
    }

    // Transform the array of location nodes into a location array where each item is an object with level, label, and value.
    pickedLocation = pickedLocation.map(node => {
      return {
        level: node.level,
        label: node.label,
        value: node.id
      }
    })
    const assignedLocation: LocationConfig = {
      "value": pickedLocation,
      "showLevels": flatLocationList.locationsLevels
    }
    
    
    // @TODO Assign a location.
    device = <Device>{
      _id: id,
      token,
      key: 'test',
      assignedLocation: assignedLocation,
      syncLocations: [assignedLocation],
      collection: 'Device',
      version: 'sandbox',
      claimed: true,
    }
    return device;
  }
}


