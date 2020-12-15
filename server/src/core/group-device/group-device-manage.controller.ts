import { GroupDevice } from './../../shared/classes/group-device.class';
import { GroupDeviceService } from './../../shared/services/group-device/group-device.service';
import { Controller, All, Param, Body } from '@nestjs/common';
const log = require('tangy-log').log

@Controller('group-device-manage')
export class GroupDeviceManageController {

  constructor(
    private readonly groupDeviceService: GroupDeviceService
  ) { }

  @All('list/:groupId')
  async list(@Param('groupId') groupId) {
    return await this.groupDeviceService.list(groupId)
  }

  @All('create/:groupId')
  async create(@Param('groupId') groupId:string, @Body('deviceData') deviceData:any):Promise<GroupDevice> {
    return await this.groupDeviceService.create(groupId, deviceData)
  }

  @All('read/:groupId/:deviceId')
  async read(@Param('groupId') groupId, @Param('deviceId') deviceId) {
    return await this.groupDeviceService.read(groupId, deviceId)
  }

  @All('update/:groupId')
  async update(@Param('groupId') groupId, @Body('device') device:GroupDevice) {
    const freshDevice = await this.groupDeviceService.update(groupId, device)
    return freshDevice
  }

  @All('reset/:groupId/:deviceId')
  async reset(@Param('groupId') groupId, @Param('deviceId') deviceId) {
    const freshDevice = await this.groupDeviceService.reset(groupId, deviceId)
    return freshDevice
  }

  @All('delete/:groupId/:deviceId')
  async delete(@Param('groupId') groupId:string, @Param('deviceId') deviceId:string) {
    await this.groupDeviceService.delete(groupId, deviceId)
    return {} 
  }

  @All('did-sync/:groupId/:deviceId/:token/:version')
  async didSync(@Param('groupId') groupId, @Param('deviceId') deviceId, @Param('token') token, @Param('version') version) {
    try {
      if (!await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, token)) {
        return 'Token does not match'
      }
      const device = await this.groupDeviceService.didSync(groupId, deviceId, version)
      return device
    } catch (error) {
      log.error('Error syncing device')
      console.log(error)
      return 'There was an error.'
    }
  }

  @All('did-sync-error/:groupId/:deviceId/:token/:version/:error')
  async didSyncError(@Param('groupId') groupId, @Param('deviceId') deviceId, @Param('token') token, @Param('version') version, @Param('error') error) {
    try {
      if (!await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, token)) {
        return 'Token does not match'
      }
      const device = await this.groupDeviceService.didSyncError(groupId, deviceId, version, error)
      return device
    } catch (error) {
      log.error('Error syncing device')
      console.log(error)
      return 'There was an error.'
    }
  }

  @All('did-update/:groupId/:deviceId/:token/:version')
  async didUpdate(@Param('groupId') groupId, @Param('deviceId') deviceId, @Param('token') token, @Param('version') version) {
    try {
      if (!await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, token)) {
        return 'Token does not match'
      }
      const device = await this.groupDeviceService.didUpdate(groupId, deviceId, version)
      return device
    } catch (error) {
      log.error('Error updating device')
      console.log(error)
      return 'There was an error.'
    }
  }

  @All('register/:groupId/:deviceId/:token')
  async register(@Param('groupId') groupId:string, @Param('deviceId') deviceId:string, @Param('token') token:string) {
    try {
      if (!await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, token)) {
        return 'Token does not match'
      }
      const device = await this.groupDeviceService.register(groupId, deviceId)
      return device
    } catch (error) {
      log.error('Error registering device')
      console.log(error)
      return 'There was an error.'
    }
  }

  @All('unregister/:groupId/:deviceId/:token')
  async unregister(@Param('groupId') groupId:string, @Param('deviceId') deviceId:string, @Param('token') token:string) {
    try {
      if (!await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, token)) {
        return 'Token does not match'
      }
      await this.groupDeviceService.unregister(groupId, deviceId)
      return 'ok' 
    } catch (error) {
      log.error('Error registering device')
      console.log(error)
      return 'There was an error.'
    }
  }

}
