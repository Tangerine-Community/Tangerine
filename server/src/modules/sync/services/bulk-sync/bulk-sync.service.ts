import { Injectable } from '@nestjs/common';
import axios from "axios";
import {v4 as UUID} from 'uuid'
const PouchDB = require('pouchdb')
const dbDefaults = require('./db-defaults.js')
const replicationStream = require('pouchdb-replication-stream');
PouchDB.defaults(dbDefaults, {timeout: 50000})
// register pouch-replication-stream as a plugin
PouchDB.plugin(replicationStream.plugin);
PouchDB.adapter('writableStream', replicationStream.adapters.writableStream);

@Injectable()
export class BulkSyncService {

  async dump(groupId:string, deviceId:string, syncUsername:string, syncPassword:string) {
    const stream = await axios.get(`${process.env.T_COUCHDB_ENDPOINT}/api/sync/${groupId}/${deviceId}/${syncUsername}/${syncPassword}`)
    return stream
  }

}
