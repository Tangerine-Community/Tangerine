import {Injectable} from '@angular/core';
import {Message} from '../peers/message';
import {Endpoint} from '../peers/endpoint';
import {MOCK_ENDPOINTS} from '../peers/mock-endpoints';
// @ts-ignore
import PouchDB from 'pouchdb';

@Injectable({
  providedIn: 'root'
})
export class PeersService {
  window: any;
  isMaster = false;
  constructor() {
    this.window = window;
  }

  async getDatabase() {
    const db = new PouchDB('kittens');
    const doc = {
      '_id': 'mittens',
      'name': 'Mittens',
      'occupation': 'kitten',
      'age': 3,
      'hobbies': [
        'playing with balls of yarn',
        'chasing laser pointers',
        'lookin\' hella cute'
      ]
    };
    try {
      db.put(doc).then(() =>  db );
    } catch (e) {
      console.log('Already have Mittens:' + e);
    }
  }

  sleep(milliseconds) {
    return new Promise((res, rej) => {
      setTimeout(() => {
        res()
        console.log("done")
      }, milliseconds)
    })
  }

  async getTangyP2PPermissions() {
    // await this.sleep(10 * 1000)
    // return 'OK'
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
  successAdvert = (response: Message, endpoints: Endpoint[]) => {
    if (response['messageType'] === 'log') {
      return new Message('log', response['message'], null, null);
    } else if (response['messageType'] === 'localEndpointName') {
      return new Message('localEndpointName', response['message'], null, null);
    } else if (response['messageType'] === 'endpoints') {
      console.log('endpoints: ' + JSON.stringify(response['object']));
      const newEndpoints = response['object'].object;
      for (const [key, value] of Object.entries(newEndpoints)) {
        console.log(`${key}: ${value}`);
        const endpoint = {} as Endpoint;
        endpoint.id = key;
        endpoint.endpointName = <String>value;
        let isUnique = true;
        endpoints.forEach((peer: Endpoint) => {
          if (endpoint.id === peer.id) {
            isUnique = false;
          }
        })
        if (isUnique) {
          endpoints.push(endpoint);
        }
      }
      return new Message('endpoints', null, endpoints, null);
    } else if (response.messageType === 'payload') {
      // load the data sent and then send your own.
      // const messageStr = response.message;
      // TODO: JSONObject is available if we need it.
      const payload: Message = <Message>response.object;
      const databaseDump = payload.object;
      PouchDB.plugin(window['PouchReplicationStream'].plugin);
      PouchDB.adapter('writableStream', window['PouchReplicationStream'].adapters.writableStream);
      const writeStream = new window['Memorystream'];
      writeStream.end(databaseDump);
      const dest = new PouchDB('kittens');
      dest.load(writeStream).then(async () => {
        const pluginMessage = 'I loaded data from the peer device. Now I will send you my data.';
        const db = await this.getDatabase();
        const dumpedString = await this.dumpData(db)
        let message: Message;
        if (this.isMaster) {
          return new Message('payload', pluginMessage, null, null);
        } else {
          try {
            console.log('Pushing data to master.')
            const payload: Message = new Message('payload', pluginMessage, dumpedString, null);
            message = await this.pushData(payload);
            return new Message('payload', pluginMessage, null, null);
          } catch (e) {
            return message;
          }
        }
      }).catch(function (err) {
        console.log(err);
        return new Message('error', err, null, null);
      });
    }
  };
  errorAdvert = function(errorMsg) {
    console.log('error:' + errorMsg);
    return new Message('error', errorMsg, null, null);
  };

  async startAdvertising(endpoints: Endpoint[]) {
    // if (this.window.isCordovaApp) {
      const message: Message = <Message>await new Promise((resolve, reject) => {
        window['cordova']['plugins']['NearbyConnectionsPlugin'].startAdvertising(null, (response: Message, endpoints: Endpoint[]) => {
          if (response['messageType'] === 'log') {
            resolve(new Message('log', response['message'], null, null));
          } else if (response['messageType'] === 'localEndpointName') {
            resolve(new Message('localEndpointName', response['message'], null, null));
          } else if (response['messageType'] === 'endpoints') {
            let endpointList: Endpoint[] = [];
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
            // console.log('enpoints go here.')
            // endpointList = MOCK_ENDPOINTS;
            resolve(new Message('endpoints', null, endpointList, null));
          } else if (response.messageType === 'payload') {
            // load the data sent and then send your own.
            // const messageStr = response.message;
            // TODO: JSONObject is available if we need it.
            const payload: Message = <Message>response.object;
            const databaseDump = payload.object;
            PouchDB.plugin(window['PouchReplicationStream'].plugin);
            PouchDB.adapter('writableStream', window['PouchReplicationStream'].adapters.writableStream);
            const writeStream = new window['Memorystream'];
            writeStream.end(databaseDump);
            const dest = new PouchDB('kittens');
            dest.load(writeStream).then(async () => {
              const pluginMessage = 'I loaded data from the peer device. Now I will send you my data.';
              const db = await this.getDatabase();
              const dumpedString = await this.dumpData(db)
              let message: Message;
              if (this.isMaster) {
                resolve(new Message('payload', pluginMessage, null, null));
              } else {
                try {
                  console.log('Pushing data to master.')
                  const payload: Message = new Message('payload', pluginMessage, dumpedString, null);
                  message = await this.pushData(payload);
                  resolve(new Message('payload', pluginMessage, null, null));
                } catch (e) {
                  reject(message);
                }
              }
            }).catch(function (err) {
              console.log(err);
              reject(new Message('error', err, null, null));
            });
          }
          }, function(errorMsg) {
            console.log('error:' + errorMsg);
          reject(new Message('error', errorMsg, null, null));
        });
      }
      );
      return message;
    // } else {
    //   // testing or using a PWA; emulating a response from the plugin
    //   // endpoints = MOCK_ENDPOINTS;
    //   // return new Message('endpoints', null, endpoints);
    //   const obj = {
    //     message: 'Endpoints',
    //     messageType: 'endpoints',
    //     object: {
    //       'tab1': 'tab1',
    //       'tab2': 'tab2',
    //       'tab3': 'tab3'
    //     }
    //   };
    //   const response: Message = new Message('endpoints', 'Endpoints', obj, null);
    //   const message = this.successAdvert(response, endpoints);
    //   return message;
    // }
  }

  async connectToEndpoint(endpoint): Promise<Message> {
    let message: Message;
    this.isMaster = true;
    const db = await this.getDatabase();
    const dumpedString = this.dumpData(db)
    if (this.window.isCordovaApp) {
      await window['cordova']['plugins']['NearbyConnectionsPlugin'].connectToEndpoint(endpoint,
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
          return message;
        },
        function (error) {
          console.log('error:' + error);
          const logEl = document.querySelector('#p2p-results');
          logEl.innerHTML = logEl.innerHTML + '<p>' + 'error:' + error + '</p>\n';
          message = new Message('error', error, null, null);
        }
      );
    }
    return message;
  }

  async dumpData(db) {
    let message: Message;
    PouchDB.plugin(window['PouchReplicationStream'].plugin);
    PouchDB.adapter('writableStream', window['PouchReplicationStream'].adapters.writableStream);
    let dumpedString = '';
    const stream = new window['Memorystream']();
    stream.on('data', function (chunk) {
      dumpedString += chunk.toString();
    });

    //   await db.dump(stream).then(await function () {
    //     return dumpedString;
    //   }).catch(function (err) {
    //     console.log('oh no an error', err);
    //     message = new Message('error', err, null);
    //     return message;
    //   });
    //   return message;
    // }
    // dumpedString = await db.dump(stream);

    dumpedString = <string>await new Promise((resolve, reject) => {
      db.dump(stream).then(() => {
        console.log('dude')
        resolve(<string>dumpedString);
      });
    })
    return dumpedString;
  }

  async pushData(payload: Message) {
      // console.log('Yay, I have a dumpedString: ' + dumpedString);
      const result: Message = await window['cordova']['plugins']['NearbyConnectionsPlugin'].transferData(payload, function(message) {
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
      }, function(err) {
        console.log('TangyP2P error:: ' + err);
        const message: Message = new Message('error', err, null, null);
        return message;
      });
      return result;
  }
}
