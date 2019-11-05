import { TestBed } from '@angular/core/testing';

import { PeersService } from './peers.service';
import PouchDB from 'pouchdb';
import {Endpoint} from "../peers/endpoint";
import {Message} from "../peers/message";
import {MOCK_ENDPOINTS} from "../peers/mock-endpoints";

let tab1: PouchDB;
let tab2: PouchDB;
let tab3: PouchDB;

class MockPeersService {
  endpoint: Endpoint;
  getTangyP2PPermissions() {
      return 'OK';
  };

  async startAdvertising(endpoints: Endpoint[]) {
    // const messageType = 'endpoints';
    // if (messageType === 'log') {
    //   return new Message('log', 'ping', null);
    // } else if (messageType === 'localEndpointName') {
    //   return new Message('localEndpointName', '12345', null);
    // } else if (messageType === 'endpoints') {
    endpoints = MOCK_ENDPOINTS;
    return new Message('endpoints', null, endpoints);
    // } else if (messageType === 'payload') {
    //   const pluginMessage = 'I loaded data from the peer device.';
    //   return new Message('payload', pluginMessage, null);
    // }
  };

  async connectToEndpoint(endpoint): Promise<Message> {
    this.endpoint = endpoint;
    const message: Message = await this.transferData();
    return message;
  }

  async transferData(): Promise<Message> {
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
      '_id': 'supercat',
      'name': 'supercat'
    };
    try {
      source.put(doc);
    } catch (e) {
      console.log('Already have supercat:' + e);
    }
    source.dump(stream).then(function () {
      // copy data to the destination pouch
      const writeStream =  new window['Memorystream'];
      writeStream.end(dumpedString);
      const dest = new PouchDB(this.endpoint);
      const pluginMessage = 'I loaded data from the peer device.';
      dest.load(writeStream).then(function () {
        message = new Message('payload', pluginMessage, null);
      }).catch(function (err) {
        console.log(err);
        message = new Message('error', err, null);
      });
      return message;
    }).catch(function (err) {
      console.log('oh no an error', err);
      message = new Message('error', err, null);
      return message;
    });
    return message;
  }

}

describe('PeersService', () => {

  let endpoints: Endpoint[];
  beforeEach(
    () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: PeersService, useClass: MockPeersService}
        ]
      });
      tab1 = new PouchDB('tab1');
      let doc = {
        '_id': 'mittens',
        'name': 'Mittens'
      };
      try {
        tab1.put(doc);
      } catch (e) {
        console.log('Already have Mittens:' + e);
      }
      tab2 = new PouchDB('tab2');
      doc = {
        '_id': 'tripy',
        'name': 'Tripy'
      };
      try {
        tab2.put(doc);
      } catch (e) {
        console.log('Already have Tripy:' + e);
      }
      tab3 = new PouchDB('tab3');
      doc = {
        '_id': 'alma',
        'name': 'Alma'
      };
      try {
        tab3.put(doc);
      } catch (e) {
        console.log('Already have Mittens:' + e);
      }
    }
  );

  it('should be created', () => {
    const service: PeersService = TestBed.get(PeersService);
    expect(service).toBeTruthy();
  });


  it('got permissions', () => {
    const service: PeersService = TestBed.get(PeersService);
    const message: string = service.getTangyP2PPermissions();
    expect(message).toEqual('OK');
  });

  it('start advertising', async() => {
    const service: PeersService = TestBed.get(PeersService);
    this.endpoints = [];
    const message: Message = await service.startAdvertising(this.endpoints);
    this.endpoints = message.object;

    expect(this.endpoints.length).toEqual(3);
  });

  it('connect To Endpoint', async() => {
    const service: PeersService = TestBed.get(PeersService);
    const message: Message = await service.connectToEndpoint(this.endpoints[0]);
    const expectedMessage = 'I loaded data from the peer device.';
    expect(message.message).toEqual(expectedMessage);
  });

});
