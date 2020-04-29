import axios from 'axios'

export class UserDatabase {

  userId: string;
  username: string;
  name: string;
  deviceId: string;
  buildId:string;
  buildChannel:string;
  groupId:string;

  constructor(username: string, userId: string, key:string = '', deviceId: string, shared = false, buildId = '', buildChannel = '', groupId = '') {
    this.userId = userId
    this.username = username
    this.name = username
    this.deviceId = deviceId
    this.buildId = buildId
    this.buildChannel = buildChannel
    this.groupId = groupId 
  }

  async get(id) {
    await axios.get(`/api/${this.groupId}/${id}`)
  }

  async put(doc) {
    return await axios.put(`/api/${this.groupId}`, {
      ...doc,
      tangerineModifiedByUserId: this.userId,
      tangerineModifiedByDeviceId: this.deviceId,
      tangerineModifiedOn: Date.now(),
      buildId: this.buildId,
      deviceId: this.deviceId,
      groupId: this.groupId,
      buildChannel: this.buildChannel,
      // Backwards compatibility for sync protocol 1. 
      lastModified: Date.now()
    });
  }

  async post(doc) {
    return await axios.post(`/api/${this.groupId}`, {
      ...doc,
      tangerineModifiedByUserId: this.userId,
      tangerineModifiedByDeviceId: this.deviceId,
      tangerineModifiedOn: Date.now(),
      buildId: this.buildId,
      deviceId: this.deviceId,
      groupId: this.groupId,
      buildChannel: this.buildChannel,
      // Backwards compatibility for sync protocol 1. 
      lastModified: Date.now()
    });
  }

  async remove(doc) {
    return await axios.delete(`/api/${this.groupId}`, doc)
  }

}
