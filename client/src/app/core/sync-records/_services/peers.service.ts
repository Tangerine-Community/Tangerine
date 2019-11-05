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
  constructor() {
    this.window = window;
  }

  getTangyP2PPermissions() {
    if (this.window.isCordovaApp) {
      window['cordova']['plugins']['NearbyConnectionsPlugin'].getPermission(null, function(response: Message) {
          if (response.messageType === 'log') {
            return response.message;
          }
        },
        function(error) {
          console.log('error:' + error);
          return 'Error:' + error;
        });
    } else {
      return 'OK';
    }
  }

  async startAdvertising(endpoints: Endpoint[]) {
    if (this.window.isCordovaApp) {
      window['cordova']['plugins']['NearbyConnectionsPlugin'].startAdvertising(null, (response) => {
          if (response['messageType'] === 'log') {
            return new Message('log', response['message'], null);
          } else if (response['messageType'] === 'localEndpointName') {
            return new Message('localEndpointName', response['message'], null);
          } else if (response['messageType'] === 'endpoints') {
            console.log('endpoints: ' + JSON.stringify(response['object']));
            const newEndpoints = response['object'];
            for (const [key, value] of Object.entries(newEndpoints)) {
              console.log(`${key}: ${value}`);
              // const enpoint: Endpoint = {id: key, endpointName: value};
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
            return new Message('endpoints', null, endpoints);

          } else if (response.messageType === 'payload') {
            const messageStr = response.message;
            // TODO: JSONObject is available if we need it.
            // const object = response.object;
            PouchDB.plugin(window['PouchReplicationStream'].plugin);
            PouchDB.adapter('writableStream', window['PouchReplicationStream'].adapters.writableStream);
            const writeStream =  new window['Memorystream'];
            writeStream.end(messageStr);
            const dest = new PouchDB('kittens');
            const pluginMessage = 'I loaded data from the peer device.';
            dest.load(writeStream).then(function () {
              return new Message('payload', pluginMessage, null);
            }).catch(function (err) {
              console.log(err);
              return new Message('error', err, null);
            });
          }
        },
        function(error) {
          console.log('error:' + error);
          return new Message('error', error, null);
        });
    } else if (!this.window.isCordovaApp) {
      // testing using a PWA
      endpoints = MOCK_ENDPOINTS;
      return new Message('endpoints', null, endpoints);
    }
  }

  async connectToEndpoint(endpoint): Promise<Message> {
    let message: Message;
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
            console.log('endpoint: ' + JSON.stringify(response['object']) + ' endpointId: ' + endpointName);
            message = await this.transferData();
          }
          return message;
        },
        function (error) {
          console.log('error:' + error);
          const logEl = document.querySelector('#p2p-results');
          logEl.innerHTML = logEl.innerHTML + '<p>' + 'error:' + error + '</p>\n';
          message = new Message('error', error, null);
        }
      );
    }
    return message;
  }

  async transferData() {
    let message: Message;
    PouchDB.plugin(window['PouchReplicationStream'].plugin);
    PouchDB.adapter('writableStream', window['PouchReplicationStream'].adapters.writableStream);
    let dumpedString = '';
    const stream = new window['Memorystream']();
    stream.on('data', function(chunk) {
      dumpedString += chunk.toString();
    });
    const source = new PouchDB('kittens');
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
      source.put(doc);
    } catch (e) {
      console.log('Already have Mittens:' + e);
    }
    source.dump(stream).then(function () {
      // console.log('Yay, I have a dumpedString: ' + dumpedString);
      window['cordova']['plugins']['NearbyConnectionsPlugin'].transferData(dumpedString, function(message) {
        const objectConstructor = ({}).constructor;
        if (message.constructor === objectConstructor) {
          if (message.messageType === 'payloadReceived') {
            const messageStr = message.message;
            // document.querySelector('#p2p-results').innerHTML += messageStr + '<br/>';
            // document.querySelector('#transferProgress').innerHTML += messageStr + '<br/>';
            message = new Message('payloadReceived', messageStr, null);
          } else {
            const messageStr = message.message;
            // document.querySelector('#p2p-results').innerHTML += messageStr + '<br/>';
            message = new Message('log', messageStr, null);
          }
        } else {
          // document.querySelector('#p2p-results').innerHTML += message + '<br/>';
          message = new Message('log', message, null);
        }
        return message;
      }, function(err) {
        console.log('TangyP2P error:: ' + err);
        message = new Message('error', err, null);
        return message;
      });
    }).catch(function (err) {
      console.log('oh no an error', err);
      message = new Message('error', err, null);
      return message;
    });
    return message;
  }
}
