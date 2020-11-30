import axios from 'axios'

export class UserDatabase {

  userId: string;
  username: string;
  name: string;
  deviceId: string;
  buildId:string;
  buildChannel:string;
  groupId:string;

  constructor(userId: string, groupId = '') {
    this.userId = userId
    this.username = userId
    this.name = userId
    this.deviceId = 'EDITOR' 
    this.buildId = 'EDITOR' 
    this.buildChannel = 'EDITOR' 
    this.groupId = groupId 
  }

  async get(id) {
    const token = localStorage.getItem('token');
    return (<any>await axios.get(`/group-responses/read/${this.groupId}/${id}`, { headers: { authorization: token }})).data
  }

  async put(doc) {
    const token = localStorage.getItem('token');
    return await (<any>axios.post(`/group-responses/update/${this.groupId}`, {response: {
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
    }},
    {
      headers: {
        authorization: token
      }
    })).data;
  }

  async post(doc) {
    const token = localStorage.getItem('token');
    return (<any>await axios.post(`/group-responses/update/${this.groupId}`, {response: {
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
    }},
    {
      headers: {
        authorization: token
      }
    }
    )).data;
  }

  async remove(doc) {
    const token = localStorage.getItem('token');
    return await axios.post(`/group-responses/delete/${this.groupId}/${doc._id}`, {}, {
      headers: {
        authorization: token
      }
    })
  }

}
