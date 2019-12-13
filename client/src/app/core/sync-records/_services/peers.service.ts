import {Injectable, OnInit} from '@angular/core';
import {Message} from '../peers/message';
import {Endpoint} from '../peers/endpoint';
import {MOCK_ENDPOINTS} from '../peers/mock-endpoints';
// @ts-ignore
import PouchDB from 'pouchdb';
import {UserService} from '../../../shared/_services/user.service';

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
    private userService: UserService
  ) {
    this.window = window;
    this.init();
  }

  async init() {
    this.localDatabase = await this.getLocalDatabase();
  }

  async getLocalDatabase() {
    // get the local db this.getUserService.getUserdatabase - has a .db property - can use the sync method
    PouchDB.plugin(window['PouchReplicationStream'].plugin);
    PouchDB.adapter('writableStream', window['PouchReplicationStream'].adapters.writableStream);
    // const dbName = new PouchDB((await this.userService.getUserDatabase()).db.name);
    const userDatabase = await this.userService.getUserDatabase();
    const userDatabaseName = userDatabase.db.name;
    const username = userDatabaseName.replace('_pouchdb', '');
    console.log('userDatabaseName: ' + userDatabaseName + ' username: ' + username);
    const db = new PouchDB(username);
    return db;
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
            console.log('error:' + error);
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
      const message: Message = new Message('error', errorMsg, null, null, null);
      // document.querySelector('#p2p-results').innerHTML += message.message + '<br/>';
      const event = new CustomEvent('error', {detail: message});
      this.el.dispatchEvent(event);
    }

  successAdvertising = (response: Message) => {
      let message: Message;
      if (response['messageType'] === 'log') {
        message = new Message('log', response['message'], null, null, null);
        const event = new CustomEvent('log', {detail: message});
        this.el.dispatchEvent(event);
      } else if (response['messageType'] === 'localEndpointName') {
        message = new Message('localEndpointName', response['message'], null, null, null);
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
          endpoint.endpointName = <String>value;
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
        message = new Message('endpoints', null, endpointList, null, null);
        const event = new CustomEvent('endpoints', {detail: message});
        this.el.dispatchEvent(event);
      } else if (response['messageType'] === 'payload') {
        // load the data sent from the peer and then send your own.
        // TODO: JSONObject is available if we need it.
        const payload: Message = <Message>response.object;
        const databaseDump = payload.object;
        const writeStream = new window['Memorystream'];
        writeStream.end(databaseDump);
        const dest = new PouchDB('tempDb');
        dest.load(writeStream).then(async () => {
          // replicate received database to the local db
          // await new Promise((resolve, reject) => {
          await dest.replicate.to(this.localDatabase)
            .on('complete', function () {
            console.log('replication done! ' );
          }).on('error', function (err) {
            console.log('error in replication: ' + err);
          });
          const dumpedString = await this.dumpData(this.localDatabase)
          let pushDataMessage: Message;
          if (this.isMaster) {
            // TODO - should be a confirmation that *some* data was sent - a proof of life
            // TODO at this point, he can move to another peer.
            const doneMessage = 'Done! Sync next device.'
            console.log('done! ' + doneMessage);
            let currentEndpointId;
            if (this.currentEndpoint) {
              currentEndpointId = this.currentEndpoint.id;
            }
            message = new Message('done', doneMessage, null, currentEndpointId, null);
            const event = new CustomEvent('done', {detail: message});
            this.el.dispatchEvent(event);
          } else {
            try {
              const pluginMessage = 'Pushing local db to master.';
              console.log(pluginMessage);
              const upload: Message = new Message('payload', pluginMessage, dumpedString, null, null);
              pushDataMessage = await this.pushData(upload);
              if (typeof pushDataMessage !== 'undefined') {
                console.log('pushDataMessage message: ' + pushDataMessage['message']);
                message = new Message('done', pushDataMessage['message'], null, null, null);
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
        }).catch((err) => {
          console.log(err);
          message = new Message('error', err, null, null, null);
          const event = new CustomEvent('error', {detail: message});
          this.el.dispatchEvent(event);
        });
      }
    };

// async connectToEndpoint(endpoint): Promise<Message> {
  // endpointStr is sent as a string with id and name separated by a '_'
  async connectToEndpoint(endpointStr) {
    const ep = endpointStr.split('_');
    const endpoint = new Endpoint(ep[0], ep[1], 'Pending')
    this.currentEndpoint = endpoint;
    this.isMaster = true;
    const dumpedString = await this.dumpData(this.localDatabase)
    if (this.window.isCordovaApp) {
    const result: Message = await new Promise((resolve, reject) => {
      let message: Message;
      this.el.addEventListener('done', () => {
        resolve(message);
      });
      window['cordova']['plugins']['NearbyConnectionsPlugin'].connectToEndpoint(endpointStr,
        async (response: Message) => {
          if (response['messageType'] === 'log') {
            const logEl = document.querySelector('#p2p-results');
            logEl.innerHTML = logEl.innerHTML + '<p>' + response['message'] + '</p>\n';
            message = response;
          } else if (response['messageType'] === 'connected') {
            const ep = response['object'];
            const endpointName = Object.values(ep)[0];
            console.log('pushing data to endpoint: ' + JSON.stringify(response['object']) + ' endpointId: ' + endpointName);
            // const db = await this.getDatabase();
            const payload: Message = new Message('payload', 'Data from master', dumpedString, null, null);
            message = await this.pushData(payload);
          }
        },
        function (error) {
          console.log('error:' + error);
          const logEl = document.querySelector('#p2p-results');
          logEl.innerHTML = logEl.innerHTML + '<p>' + 'error:' + error + '</p>\n';
          message = new Message('error', error, null, null, null);
        }
      );
    });
    return result;
    }
  }

  async dumpData(db: PouchDB) {
    let dumpedString = '';
    const stream = new window['Memorystream']();
    stream.on('data', function (chunk) {
      dumpedString += chunk.toString();
    });
    dumpedString = <string>await new Promise((resolve, reject) => {
      db.dump(stream).then(() => {
        console.log('Dump from db complete!')
        resolve(<string>dumpedString);
        // return dumpedString;
      });
      // dumpedString = await db.dump(stream);
    })
    return dumpedString;
  }

  async pushData(payload: Message) {
    if (this.window.isCordovaApp) {
      const result: Message = await window['cordova']['plugins']['NearbyConnectionsPlugin'].transferData(payload, (message) => {
        // console.log('TangyP2P: Data transferred from peer to master.' );
        if (typeof message !== 'undefined') {
          console.log('pushData: messageType: ' + message.messageType + ' message.message: ' + message.message);
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
            message = new Message('payloadReceived', messageStr, null, endpointId, null);
            console.log('payloadReceived: Preparing to send event; message: ' + JSON.stringify(message));
            const event = new CustomEvent('done', {detail: message});
            this.el.dispatchEvent(event);
            // when a transfer has been re-sent.
          } else if (message.messageType === 'payload') {
            this.successAdvertising(message.object);
          } else {
            const messageStr = message.message;
            // document.querySelector('#p2p-results').innerHTML += messageStr + '<br/>';
            message = new Message('log', messageStr, null, null, null);
          }
        } else {
          // document.querySelector('#p2p-results').innerHTML += message + '<br/>';
          message = new Message('log', message, null, null, null);
        }
        return message;
      }, (err) => {
        console.log('TangyP2P error:: ' + err);
        const message: Message = new Message('error', err, null, null, null);
        return message;
      });
      return result;
    }
  }
}
