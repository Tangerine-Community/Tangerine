import {HttpService, Injectable} from '@nestjs/common';
const PouchDB = require('pouchdb')
const dbDefaults = require('../../../../db-defaults')
const replicationStream = require('pouchdb-replication-stream');
PouchDB.defaults(dbDefaults, {timeout: 50000})
// register pouch-replication-stream as a plugin
PouchDB.plugin(replicationStream.plugin);
PouchDB.adapter('writableStream', replicationStream.adapters.writableStream);

@Injectable()
export class BulkSyncService {
  constructor(private httpService: HttpService) {}
  
  async dump(groupId:string, deviceId:string, syncUsername:string, syncPassword:string) {
    console.log("Dumping database at route /api/generateDbDump.")
    const response = await this.httpService.get(`/api/generateDbDump/${groupId}/${deviceId}/${syncUsername}/${syncPassword}`).toPromise();
    return response.data;
  }
  
  async getDbDump(groupId:string, locationIdentifier:string) {
    console.log("Dumping database at route /api/getDbDump.")
    const response = await this.httpService.get(`/api/getDbDump/${groupId}/${locationIdentifier}/`).toPromise();
    return response.data;
  }
  
}
