import {Injectable, OnInit} from '@angular/core';
import {Message} from '../peers/message';
import {Endpoint} from '../peers/endpoint';
// @ts-ignore
import PouchDB from 'pouchdb';
import {UserService} from '../../../shared/_services/user.service';
import {ReplicationStatus} from "../../../sync/classes/replication-status.class";
import {ConflictService} from "../../../sync/services/conflict.service";

@Injectable({
  providedIn: 'root'
})
export class PeersService {
  window: any;
  isMaster = false;
  el: any  = document.createElement('div');
  localDatabase: PouchDB;
  currentEndpoint: Endpoint;
  peer: Endpoint;
  endpoints: Endpoint[];

  constructor(
    private userService: UserService,
    private conflictService: ConflictService
  ) {
    this.window = window;
    this.init();
  }

  async init() {
    this.localDatabase = await this.getLocalDatabase();
  }

  async getLocalDatabase() {
    const userDatabase = await this.userService.getUserDatabase();
    const userDatabaseName = userDatabase.db.name;
    const username = userDatabaseName.replace('_pouchdb', '');
    console.log('userDatabaseName: ' + userDatabaseName + ' username: ' + username);
    return userDatabase.db;
  }

  sleep(milliseconds) {
    return new Promise((res, rej) => {
      setTimeout(() => {
        res()
        console.log('done')
      }, milliseconds)
    })
  }

  async getTangyP2PPermissions() {
    if (this.window.isCordovaApp) {
      const message: Message = <Message>await new Promise((resolve, reject) => {
        window['cordova']['plugins']['NearbyConnectionsPlugin'].getPermission(null, function (response: Message) {
            if (typeof response !== 'undefined' && response.messageType === 'log') {
              resolve(response);
            }
          },
          function (error) {
            console.log('Permissions error:' + error);
            reject('Error:' + error);
          }
        );
      });
      return message;
    }
  }

  startAdvertising(endpoints: Endpoint[]) {
    //   const message: Message = <Message>await new Promise((resolve, reject) => {
    if (this.window.isCordovaApp) {
      window['cordova']['plugins']['NearbyConnectionsPlugin'].startAdvertising(null, this.successAdvertising, this.errorAdvertising);
    }
  }

  errorAdvertising = (errorMsg) => {
      console.log('error from plugin startAdvertising: ' + errorMsg);
      const message: Message = new Message('error', errorMsg, null, null, null, null);
      // document.querySelector('#p2p-results').innerHTML += message.message + '<br/>';
      const event = new CustomEvent('error', {detail: message});
      this.el.dispatchEvent(event);
    }

  successAdvertising = async (response: Message) => {
      let message: Message;
      if (response['messageType'] === 'log') {
        message = new Message('log', response['message'], null, null, null, null);
        const event = new CustomEvent('log', {detail: message});
        this.el.dispatchEvent(event);
      } else if (response['messageType'] === 'progress') {
        const event = new CustomEvent('progress', {detail: response});
        this.el.dispatchEvent(event);
      } else if (response['messageType'] === 'localEndpointName') {
        message = new Message('localEndpointName', response['message'], null, null, null, null);
        const event = new CustomEvent('localEndpointName', {detail: message});
        this.el.dispatchEvent(event);
      } else if (response['messageType'] === 'peer') {
        console.log('peer: ' + JSON.stringify(response['object']));
        const peer = response['object'];
        this.peer = new Endpoint(peer.id, peer.endpointName, null);
      } else if (response['messageType'] === 'endpoints') {
        const endpointList: Endpoint[] = [];
        console.log('endpoints: ' + JSON.stringify(response['object']));
        const newEndpoints = response['object'];
        for (const [key, value] of Object.entries(newEndpoints)) {
          console.log(`${key}: ${value}`);
          const endpoint = {} as Endpoint;
          endpoint.id = key;
          endpoint.endpointName = <string>value;
          endpoint.status = 'Pending'
          let isUnique = true;
          endpointList.forEach((peer: Endpoint) => {
            if (endpoint.id === peer.id) {
              isUnique = false;
            }
          })
          if (isUnique) {
            endpointList.push(endpoint);
          }
        }
        this.endpoints = endpointList;
        message = new Message('endpoints', null, endpointList, null, null, null);
        const event = new CustomEvent('endpoints', {detail: message});
        this.el.dispatchEvent(event);
      } else if (response['messageType'] === 'payload') {
        // load the data sent from the peer and then send your own.
        // TODO: JSONObject is available if we need it.
        const msg = <Message>response.object;
        const payload = msg.payloadData;
        // const payload = msg.object;
        // const databaseDump = atob(base64dump);
        // const databaseDump = await (new Response(blob)).text();
        const writeStream = new window['Memorystream'];
        writeStream.end(payload);
        const tempDb = new PouchDB('tempDb');
        console.log('Loading data into tempDb');
        try {
        await tempDb.load(writeStream)
        // replicate received database to the local db
        const localDb = this.localDatabase;
        console.log('Replicating data to PouchDB: ' + localDb.name);
        // TODO: Probably don't need the .on since we've already got an await.
        // TODO: This could possible have created two stacks, and commands could happen out of order.
        await tempDb.replicate.to(localDb)
          .on('complete', async (info) => {
            const conflictsQuery = await localDb.query('sync-conflicts');
            const pullReplicationStatus = <ReplicationStatus>{
              pulled: info.docs_written,
              pullConflicts: conflictsQuery.rows.map(row => row.id)
            }
            if (pullReplicationStatus.pullConflicts.length > 0) {
              await this.conflictService.resolveConflicts(pullReplicationStatus, localDb, null, 'pull', null);
            }
            const repliMessage  = 'Data downloaded to tablet.'
            console.log(repliMessage);
            message = new Message('done', repliMessage, null, null, this.peer.id, null);
            const event = new CustomEvent('progress', {detail: message});
            this.el.dispatchEvent(event);
        }).on('error', function (err) {
          console.log('error in replication: ' + err);
        });
        if (this.isMaster) {
          // TODO - should be a confirmation that *some* data was sent - a proof of life
          // TODO at this point, he can move to another peer.
          const doneMessage = 'Done! Sync next device.'
          console.log('done! ' + doneMessage);
          let currentEndpointId;
          if (this.currentEndpoint) {
            currentEndpointId = this.currentEndpoint.id;
          }
          message = new Message('done', doneMessage, null, currentEndpointId, null, null);
          const event = new CustomEvent('done', {detail: message});
          this.el.dispatchEvent(event);
        } else {
          const dumpedString = await this.dumpData(this.localDatabase)
          let pushDataMessage: Message;
          try {
            const pluginMessage = 'Pushing local db to master.';
            console.log(pluginMessage);
            // const base64dumpPeer = btoa(dumpedString);
            // const blob = new Blob([JSON.stringify(dumpedString, null, 2)], {type : 'application/json'});
            // const blob = new Blob([dumpedString], {type : 'application/json'});
            // const upload: Message = new Message('payload', pluginMessage, blob, null, null);
            const upload: Message = new Message('payload', pluginMessage, null, null, null, null);
            pushDataMessage = await this.pushData(upload, dumpedString);
            if (typeof pushDataMessage !== 'undefined') {
              console.log('pushDataMessage message: ' + pushDataMessage['message']);
              message = new Message('done', pushDataMessage['message'], null, null, null, null);
              const event = new CustomEvent('done', {detail: message});
              this.el.dispatchEvent(event);
            }
          } catch (e) {
            message = pushDataMessage;
            console.log('Error pushing data: ' + JSON.stringify(message));
            const event = new CustomEvent('error', {detail: message});
            this.el.dispatchEvent(event);
          }
        }
        } catch (err) {
          console.log(err);
          message = new Message('error', err, null, null, null, null);
          const event = new CustomEvent('error', {detail: message});
          this.el.dispatchEvent(event);
        };
        tempDb.destroy()
      }
    };

// async connectToEndpoint(endpoint): Promise<Message> {
  // endpointStr is sent as a string with id and name separated by a '~'
  async connectToEndpoint(endpointStr) {
    const ep = endpointStr.split('~');
    const endpoint = new Endpoint(ep[0], ep[1], 'Pending')
    this.currentEndpoint = endpoint;
    this.isMaster = true;
    const dumpedString = await this.dumpData(this.localDatabase)
    if (this.window.isCordovaApp) {
    const result: Message = await new Promise((resolve, reject) => {
      let message: Message;
      this.el.addEventListener('done', () => {
        let doneMessage = 'Empty message'
        if (typeof message !== 'undefined') {
          doneMessage = message.message;
        }
        console.log('Received a done event in connectToEndpoint. Message: ' + doneMessage);
        resolve(message);
      });
      window['cordova']['plugins']['NearbyConnectionsPlugin'].connectToEndpoint(endpointStr,
        async (response: Message) => {
          if (response['messageType'] === 'log') {
            const logEl = document.querySelector('#p2p-results');
            logEl.innerHTML = logEl.innerHTML + '<p>' + response['message'] + '</p>\n';
            message = response;
          } else if (response['messageType'] === 'connected') {
            const objData = response['object'];
            const endpointName = Object.values(objData)[0];
            console.log('pushing data to endpoint: ' + JSON.stringify(response['object']) + ' endpointId: ' + endpointName);
            // const db = await this.getDatabase();
            // const base64dump = btoa(dumpedString);
            // const blob = new Blob([dumpedString], {type : 'application/json'});
            // const payload: Message = new Message('payload', 'Data from master', blob, null, null);
            const message: Message = new Message('payload', 'Data from master', null, null, null, null);
            // const aUTF16CodeUnits = new Uint16Array(myString.length);
            // Array.prototype.forEach.call(aUTF16CodeUnits, function (el, idx, arr) { arr[idx] = myString.charCodeAt(idx); });
            // var sUTF16Base64 = base64EncArr(new Uint8Array(aUTF16CodeUnits.buffer));
            // const payload = JSON.parse(dumpedString);
            const result = await this.pushData(message, dumpedString);
          }
        }, (error) => {
          let errorMessage = ''
          if (typeof error.message !== 'undefined') {
            errorMessage = error.message;
          } else {
            errorMessage = error;
          }
          console.log('connectToEndpoint error:' + errorMessage);
          message = new Message('error', errorMessage, null, null, null, null);
          const event = new CustomEvent('error', {detail: message});
          this.el.dispatchEvent(event);
        }
      );
    });
    return result;
    }
  }

  // Dumps Pouchdb. Filters out all docs and views except for TangyFormResponse.
  async dumpData(db: PouchDB) {
    let dumpedString = '';
    const stream = new window['Memorystream']();
    stream.on('data', function (chunk) {
      dumpedString += chunk.toString();
    });
    dumpedString = <string>await new Promise((resolve, reject) => {
      db.dump(stream, { filter : (doc,req) => {
          return doc.collection === 'TangyFormResponse';
        }}).then(() => {
        console.log('Dump from db complete!')
        resolve(<string>dumpedString);
        // return dumpedString;
      });
      // dumpedString = await db.dump(stream);
    })
    return dumpedString;
  }

  async pushData(message: Message, payload: string) {
    if (this.window.isCordovaApp) {
      const result: Message = await window['cordova']['plugins']['NearbyConnectionsPlugin'].transferData(message, payload, async (message) => {
        // console.log('TangyP2P: Data transferred from peer to master.' );
        if (typeof message !== 'undefined') {
          console.log('pushData: messageType: ' + message.messageType + ' message.message: ' + message.message);
          if (message.messageType === 'error') {
            const event = new CustomEvent('error', {detail: message});
            this.el.dispatchEvent(event);
          }
        }
        const objectConstructor = ({}).constructor;
        if (message.constructor === objectConstructor) {
          if (message.messageType === 'payloadReceived') {
            const messageStr = message.message;
            console.log('payloadReceived: ' + messageStr);
            // document.querySelector('#p2p-results').innerHTML += messageStr + '<br/>';
            // document.querySelector('#transferProgress').innerHTML += messageStr + '<br/>';
            let endpointId;
            if (typeof this.currentEndpoint !== 'undefined' ) {
              endpointId = this.currentEndpoint.id;
              console.log('this.currentEndpoint: ' + endpointId);
            // } else if (typeof message.originName !== 'undefined' && message.originName !== null) {
            //   const origin = this.endpoints.find(endpoint => endpoint.endpointName === message.originName);
            //   if (typeof origin !== 'undefined') {
            //     endpointId = origin.id;
            //     console.log('origin.id: ' + endpointId);
            //   }
            } else if (typeof this.peer !== 'undefined') {
              endpointId = this.peer.id;
              console.log('this.peer.id: ' + endpointId);
            }
            message = new Message('payloadReceived', messageStr, null, endpointId, null, null);
            console.log('payloadReceived: Preparing to send event; message: ' + JSON.stringify(message));
            const event = new CustomEvent('done', {detail: message});
            this.el.dispatchEvent(event);
            // when a transfer has been re-sent.
          } else if (message.messageType === 'payload') {
            console.log('Received payload message in pushData')
            await this.successAdvertising(message);
          } else if (message.messageType === 'progress') {
            console.log('Received progress message in pushData')
            // const messageStr = message.message;
            // const object = message.object;
            // message = new Message('progress', messageStr, object, null, null, null);
            await this.successAdvertising(message);
          } else if (message.messageType === 'error') {
            console.log('error from plugin transferData during pushData: ');
            // document.querySelector('#p2p-results').innerHTML += message.message + '<br/>';
            const event = new CustomEvent('error', {detail: message});
            this.el.dispatchEvent(event);
          } else {
            const messageStr = message.message;
            message = new Message('log', messageStr, null, null, null, null);
            await this.successAdvertising(message);
          }
        } else {
          // document.querySelector('#p2p-results').innerHTML += message + '<br/>';
          message = new Message('log', message, null, null, null, null);
        }
        return message;
      }, (err) => {
        console.log('TangyP2P error:: ' + JSON.stringify(err));
        const message: Message = new Message('error', err, null, null, null, null);
        const event = new CustomEvent('error', {detail: message});
        this.el.dispatchEvent(event);
        return message;
      });
      return result;
    }
  }
}
