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
    const dbName = new PouchDB((await this.userService.getUserDatabase()).db.name);
    const db = new PouchDB(dbName);
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
      const message: Message = new Message('error', errorMsg, null, null);
      // document.querySelector('#p2p-results').innerHTML += message.message + '<br/>';
      const event = new CustomEvent('error', {detail: message});
      this.el.dispatchEvent(event);
    }

  successAdvertising = (response: Message) => {
      let message: Message;
      if (response['messageType'] === 'log') {
        message = new Message('log', response['message'], null, null);
        const event = new CustomEvent('log', {detail: message});
        this.el.dispatchEvent(event);
      } else if (response['messageType'] === 'localEndpointName') {
        message = new Message('localEndpointName', response['message'], null, null);
        const event = new CustomEvent('localEndpointName', {detail: message});
        this.el.dispatchEvent(event);
      } else if (response['messageType'] === 'endpoints') {
        const endpointList: Endpoint[] = [];
        console.log('endpoints: ' + JSON.stringify(response['object']));
        const newEndpoints = response['object'];
        for (const [key, value] of Object.entries(newEndpoints)) {
          console.log(`${key}: ${value}`);
          const endpoint = {} as Endpoint;
          endpoint.id = key;
          endpoint.endpointName = <String>value;
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
        message = new Message('endpoints', null, endpointList, null);
        const event = new CustomEvent('endpoints', {detail: message});
        this.el.dispatchEvent(event);
      } else if (response.messageType === 'payload') {
        // load the data sent from the peer and then send your own.
        // TODO: JSONObject is available if we need it.
        const payload: Message = <Message>response.object;
        const databaseDump = payload.object;
        const writeStream = new window['Memorystream'];
        writeStream.end(databaseDump);
        const dest = new PouchDB('tempDb');
        dest.load(writeStream).then(async () => {
          // replicate received database to the local db
          await new Promise((resolve, reject) => {
            dest.replicate.to(this.localDatabase);
          })
          const dumpedString = await this.dumpData(this.localDatabase)
          let pushDataMessage: Message;
          if (this.isMaster) {
            // TODO - should be a confirmation that *some* data was sent - a proof of life
            // TODO at this point, he can move to another peer.
            const doneMessage = 'Data has been loaded. You may sync the next device.'
            message = new Message('done', doneMessage, null, null);
            const event = new CustomEvent('done', {detail: message});
            this.el.dispatchEvent(event);
          } else {
            try {
              const pluginMessage = 'I loaded data from the master db into mine. Now I will push my local db to master.';
              console.log(pluginMessage)
              const upload: Message = new Message('payload', pluginMessage, dumpedString, null);
              pushDataMessage = await this.pushData(upload);
              message = new Message('done', pluginMessage, null, null);
              const event = new CustomEvent('done', {detail: message});
              this.el.dispatchEvent(event);
            } catch (e) {
              message = pushDataMessage;
              console.log('Error pushing data: ' + JSON.stringify(message));
              const event = new CustomEvent('error', {detail: message});
              this.el.dispatchEvent(event);
            }
          }
        }).catch((err) => {
          console.log(err);
          message = new Message('error', err, null, null);
          const event = new CustomEvent('error', {detail: message});
          this.el.dispatchEvent(event);
        });
      }
    };

// async connectToEndpoint(endpoint): Promise<Message> {
  async connectToEndpoint(endpoint) {
    this.isMaster = true;
    const dumpedString = await this.dumpData(this.localDatabase)
    if (this.window.isCordovaApp) {
    const result: Message = await new Promise((resolve, reject) => {
      let message: Message;
      this.el.addEventListener('done', () => {
        resolve(message);
      });
      window['cordova']['plugins']['NearbyConnectionsPlugin'].connectToEndpoint(endpoint,
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
            const payload: Message = new Message('payload', 'Data from master', dumpedString, null);
            message = await this.pushData(payload);
          }
        },
        function (error) {
          console.log('error:' + error);
          const logEl = document.querySelector('#p2p-results');
          logEl.innerHTML = logEl.innerHTML + '<p>' + 'error:' + error + '</p>\n';
          message = new Message('error', error, null, null);
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
      const result: Message = await window['cordova']['plugins']['NearbyConnectionsPlugin'].transferData(payload, function (message) {
        const objectConstructor = ({}).constructor;
        if (message.constructor === objectConstructor) {
          if (message.messageType === 'payloadReceived') {
            const messageStr = message.message;
            // document.querySelector('#p2p-results').innerHTML += messageStr + '<br/>';
            // document.querySelector('#transferProgress').innerHTML += messageStr + '<br/>';
            message = new Message('payloadReceived', messageStr, null, null);
          } else {
            const messageStr = message.message;
            // document.querySelector('#p2p-results').innerHTML += messageStr + '<br/>';
            message = new Message('log', messageStr, null, null);
          }
        } else {
          // document.querySelector('#p2p-results').innerHTML += message + '<br/>';
          message = new Message('log', message, null, null);
        }
        return message;
      }, function (err) {
        console.log('TangyP2P error:: ' + err);
        const message: Message = new Message('error', err, null, null);
        return message;
      });
      return result;
    }
  }
}
