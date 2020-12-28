import {HttpService, Injectable} from '@nestjs/common';
import axios, {AxiosResponse} from "axios";
import {v4 as UUID} from 'uuid'
import {Observable} from "rxjs";
// import {Observable} from '@reactivex/rxjs/es6/Observable.js'
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
  
  async dump(groupId:string, deviceId:string, syncUsername:string, syncPassword:string): Promise<Observable<AxiosResponse<any>>>  {
    console.log("Dumping database at route /api/sync.")
    return this.httpService.get(`/api/sync/${groupId}/${deviceId}/${syncUsername}/${syncPassword}`)
  }

}
