import { GroupDeviceService } from './../../shared/services/group-device/group-device.service';
import { Controller, All, Param, Body } from '@nestjs/common';
const log = require('tangy-log').log

@Controller('group-device-public')
export class GroupDevicePublicController {

  constructor(
    private readonly groupDeviceService: GroupDeviceService
  ) { }

  @All('did-sync/:groupId/:deviceId/:token')
  async didSync(@Param('groupId') groupId, @Param('deviceId') deviceId, @Param('token') token) {
    try {
      if (!await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, token)) {
        return 'Token does not match'
      }
      const device = await this.groupDeviceService.didSync(groupId, deviceId)
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

  @All('read/:groupId/:deviceId/:token')
  async read(@Param('groupId') groupId, @Param('deviceId') deviceId, @Param('token') token) {
    try {
      if (!await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, token)) {
        return 'Token does not match'
      }
      const device = await this.groupDeviceService.read(groupId, deviceId)
      return device
    } catch (error) {
      log.error('Error registering device')
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
