import { DbService } from './../db/db.service';
import { GroupDevice } from './../../classes/group-device.class';
import { Injectable } from '@nestjs/common';
import { TangerineConfigService } from '../tangerine-config/tangerine-config.service';
import { Group } from '../../classes/group';
import PouchDB from 'pouchdb'
import { v4 as UUID } from 'uuid'
import { BehaviorSubject, Observable, Subject } from 'rxjs';
const DB = require('../../../db')
const log = require('tangy-log').log
const fs = require('fs-extra')
const tangyModules = require('../../../modules/index.js')()
const uuid = require('uuid')

@Injectable()
export class GroupDeviceService {

  constructor(
    private readonly dbService:DbService
  ) {}

  async install(groupId) {
    const groupDevicesDb = this.getGroupDevicesDb(groupId)
  }

  async uninstall(groupId) {
    const groupDevicesDb = this.getGroupDevicesDb(groupId)
    await groupDevicesDb.destroy()
  }

  async list(groupId) {
    const groupDevicesDb = this.getGroupDevicesDb(groupId)
    const response  = await groupDevicesDb.allDocs({include_docs:true})
    return response
      .rows
      .map(row => row.doc)
  }
  
  async create(groupId, deviceData:any):Promise<GroupDevice> {
    const groupDevicesDb = this.getGroupDevicesDb(groupId)
    const response = await groupDevicesDb.put({
      ...new GroupDevice(),
      ...deviceData,
      token: uuid.v4()
    })
    return <GroupDevice>await groupDevicesDb.get(response.id)
  }

  async read(groupId, deviceId) {
    const groupDevicesDb = this.getGroupDevicesDb(groupId)
    const device = <GroupDevice>await groupDevicesDb.get(deviceId)
    return device
  }

  async update(groupId, device) {
    try {
      const groupDevicesDb = this.getGroupDevicesDb(groupId)
      const originalDevice = await groupDevicesDb.get(device._id)
      await groupDevicesDb.put({
        ...device,
        _rev: originalDevice._rev
      })
      const freshDevice = <GroupDevice>await groupDevicesDb.get(device._id)
      return freshDevice
    } catch (e) {
      console.log(e)
    }
  }

  async delete(groupId, deviceId) {
    const groupDevicesDb = this.getGroupDevicesDb(groupId)
    const device = await groupDevicesDb.get(deviceId)
    await groupDevicesDb.remove(device)
  }

  async reset(groupId:string, deviceId:string) {
    try {
      const groupDevicesDb = this.getGroupDevicesDb(groupId)
      const originalDevice = await groupDevicesDb.get(deviceId)
      await groupDevicesDb.put({
        ...originalDevice,
        lastUpdated: undefined,
        version: undefined,
        token: uuid(),
        claimed: false
      })
      const freshDevice = <GroupDevice>await groupDevicesDb.get(deviceId)
      return freshDevice
    } catch (e) {
      console.log(e)
    }
  }

  async didSync(groupId:string, deviceId:string) {
    try {
      const groupDevicesDb = this.getGroupDevicesDb(groupId)
      const originalDevice = await groupDevicesDb.get(deviceId)
      await groupDevicesDb.put({
        ...originalDevice,
        syncedOn: Date.now(),
        _rev: originalDevice._rev
      })
      const freshDevice = <GroupDevice>await groupDevicesDb.get(deviceId)
      return freshDevice
    } catch (e) {
      console.log(e)
    }
  }

  async didUpdate(groupId:string, deviceId:string, version:string) {
    try {
      const groupDevicesDb = this.getGroupDevicesDb(groupId)
      const originalDevice = await groupDevicesDb.get(deviceId)
      await groupDevicesDb.put({
        ...originalDevice,
        updatedOn: Date.now(),
        version,
        _rev: originalDevice._rev
      })
      const freshDevice = <GroupDevice>await groupDevicesDb.get(deviceId)
      return freshDevice
    } catch (e) {
      console.log(e)
    }
  }

  async register(groupId, deviceId) {
    const groupDevicesDb = this.getGroupDevicesDb(groupId)
    const device = <GroupDevice>await groupDevicesDb.get(deviceId)
    if (device.claimed === true) {
      throw new Error('Trying to register a device already claimed. Unregister the device first.')
    }
    // Reset token on registration.
    await groupDevicesDb.put({
      ...device,
      claimed: true,
      registeredOn: Date.now(),
      token: uuid.v4()
    })
    return <GroupDevice>await groupDevicesDb.get(deviceId)
    
  }

  async unregister(groupId, deviceId) {
    const groupDevicesDb = this.getGroupDevicesDb(groupId)
    const device = <GroupDevice>await groupDevicesDb.get(deviceId)
    // Reset token on registration.
    const freshDevice = await groupDevicesDb.put({
      ...device,
      claimed: false,
      token: uuid.v4()
    })
    return freshDevice
  }

  async tokenDoesMatch(groupId, deviceId, token):Promise<boolean> {
    return true
  }

  private getGroupDevicesDb(groupId) {
    return this.dbService.instantiate(`${groupId}-devices`)
  }

}
