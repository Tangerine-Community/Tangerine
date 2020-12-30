import axios from 'axios'
import * as jsonpatch from "fast-json-patch"


export class UserDatabase {

  userId: string;
  username: string;
  name: string;
  deviceId: string;
  buildId:string;
  buildChannel:string;
  groupId:string;
  attachHistoryToDocs:boolean = undefined

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
    return await this.post(doc)
  }

  async post(doc) {
    const token = localStorage.getItem('token');
    if (this.attachHistoryToDocs === undefined) {
      const appConfig = (<any>await axios.get('./assets/app-config.json', { headers: { authorization: token }})).data
      this.attachHistoryToDocs = appConfig['attachHistoryToDocs']
        ? true
        : false
    }
    const newDoc = {
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
    }
    return (<any>await axios.post(`/group-responses/update/${this.groupId}`, {
      response: {
        ...newDoc,
        ...this.attachHistoryToDocs
          ? { history: await this._calculateHistory(newDoc) }
          : { }
      }
    },
    {
      headers: {
        authorization: token
      }
    }
    )).data;
  }

  async remove(doc) {
    // This is not implemented...
    const token = localStorage.getItem('token');
    return await axios.delete(`/api/${this.groupId}`, doc)
  }

  async _calculateHistory(newDoc) {
    let history = []
    try {
      const currentDoc = await this.get(newDoc._id)
      const entry = {
        lastRev: currentDoc._rev,
        patch: jsonpatch.compare(currentDoc, newDoc).filter(mod => mod.path.substr(0,8) !== '/history')
      }
      history = currentDoc.history
        ? [ entry, ...currentDoc.history ]
        : [ entry ]
    } catch (e) {
      const entry = {
        lastRev: 0,
        patch: jsonpatch.compare({}, newDoc).filter(mod => mod.path.substr(0,8) !== '/history')
      }
      history = [ entry ]
    }
    return history 
  }

}
