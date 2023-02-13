import { GroupDeviceService } from './../../shared/services/group-device/group-device.service';
import {Controller, All, Param, Body, HttpException, HttpStatus} from '@nestjs/common';
const log = require('tangy-log').log

@Controller('group-device-public')
export class GroupDevicePublicController {

  constructor(
    private readonly groupDeviceService: GroupDeviceService
  ) { }

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

  @All('did-sync-status/:groupId/:deviceId/:token/:version')
  async didSyncStatus(@Param('groupId') groupId, @Param('deviceId') deviceId, @Param('token') token, @Param('version') version, @Body('status') status) {
    try {
      if (!await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, token)) {
        return 'Token does not match'
      }
      const device = await this.groupDeviceService.didSyncStatus(groupId, deviceId, version, status)
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

  @All('did-update-status/:groupId/:deviceId/:token/:version')
  async didUpdateStatus(@Param('groupId') groupId, @Param('deviceId') deviceId, @Param('token') token, @Param('version') version, @Body('status') status) {
    try {
      if (!await this.groupDeviceService.tokenDoesMatch(groupId, deviceId, token)) {
        return 'Token does not match'
      }
      const device = await this.groupDeviceService.didUpdateStatus(groupId, deviceId, version, status)
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
      let message = 'Error registering device for group ' + groupId + ' and deviceId ' + deviceId
      let errorDetails = {
        "message" : message,
        "groupId" : groupId,
        "deviceId" : deviceId,
        "error" : error
      }
      log.error(errorDetails)
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: message,
        errorDetails: errorDetails,
      }, HttpStatus.NOT_FOUND);
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
