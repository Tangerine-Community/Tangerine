import { TestBed } from '@angular/core/testing';

import { PeersService } from './peers.service';
import PouchDB from 'pouchdb';
import {Endpoint} from "../peers/endpoint";
import {Message} from "../peers/message";
import {MOCK_ENDPOINTS} from "../peers/mock-endpoints";

let supercat: PouchDB;
let tab1: PouchDB;
let tab2: PouchDB;
let tab3: PouchDB;
let currentEndpoint: Endpoint;
class MockPeersService {
  peerService: PeersService = new PeersService();
  endpoint: Endpoint;
  messageType: string;
  getTangyP2PPermissions() {
      return 'OK';
  };

  successAdvert = (response: Message, endpoints: Endpoint[]) => {
    // PeersService.successAdvert(response: Message);
    return this.peerService.successAdvert(response, endpoints);
  }

  dumpData = async (db) => {
    const peerService = new PeersService();
    return await peerService.dumpData(db);
  }

  async startAdvertising(endpoints: Endpoint[]) {
    // endpoints = MOCK_ENDPOINTS;
    // return new Message('endpoints', null, endpoints);
    let response: Message;
    if (typeof this.messageType === 'undefined') {
      this.messageType = 'endpoints';
      const obj = {
        'message': 'Endpoints',
        'messageType': 'endpoints',
        'object': {
          'tab1': 'tab1',
          'tab2': 'tab2',
          'tab3': 'tab3'
        }
      };
      response = new Message(this.messageType, 'Endpoints', obj, null);
    }
    // else if (this.messageType === 'payload') {
    //   const pluginMessage = 'I loaded data from the peer device. Now I will send you my data.';
    //   response = new Message(this.messageType, pluginMessage, null);
    // }

    return this.successAdvert(response, endpoints);
  };

  async connectToEndpoint(endpoint): Promise<Message> {
    currentEndpoint = endpoint;
    const db = supercat;
    const dumpedString = await this.dumpData(db)
    const message: Message = await this.pushData(dumpedString);
    return message;
  }

  async pushData(dumpedString): Promise<Message> {
    let message: Message;
    // copy data to the destination pouch
    const writeStream =  new window['Memorystream'];
    writeStream.end(dumpedString);
    const dest = new PouchDB(currentEndpoint.id);
    const pluginMessage = 'I transferred data to the peer device.';
    await dest.load(writeStream).then(function () {
      message = new Message('payload', pluginMessage, null, null);
    }).catch(function (err) {
      console.log(err);
      message = new Message('error', err, null, null);
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

      supercat = new PouchDB('supercat');
      let doc = {
        '_id': 'supercat',
        'name': 'Supercat'
      };
      try {
        supercat.put(doc);
      } catch (e) {
        console.log('Already have Supercat:' + e);
      }

      tab1 = new PouchDB('tab1');
      doc = {
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
        console.log('Already have Alma:' + e);
      }
    }
  );

  afterEach(async () => {
    const supercatT = new PouchDB('supercat')
    await supercatT.destroy()

    const tab1T = new PouchDB('tab1')
    await tab1T.destroy()

    const tab2T = new PouchDB('tab2')
    await tab2T.destroy()

    const tab3T = new PouchDB('tab3')
    await tab3T.destroy()

  })

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

  it('transfer data to tab1', async() => {
    const service: PeersService = TestBed.get(PeersService);
    const message: Message = await service.connectToEndpoint(this.endpoints[0]);
    let hasDoc = false;
    await tab1.get('supercat').then(function (doc) {
      console.log(doc);
      hasDoc = true;
    });
    expect(hasDoc).toEqual(true);
  });

  it('get data from tab 1', async() => {
    const service: PeersService = TestBed.get(PeersService);
    this.endpoints = [];
    const message: Message = await service.startAdvertising(this.endpoints);
    this.endpoints = message.object;

    expect(this.endpoints.length).toEqual(3);
  });

  it('transfer data to tab2', async() => {
    const service: PeersService = TestBed.get(PeersService);
    const message: Message = await service.connectToEndpoint(this.endpoints[1]);
    let hasDoc = false;
    await tab2.get('supercat').then(function (doc) {
      console.log(doc);
      hasDoc = true;
    });
    expect(hasDoc).toEqual(true);
  });

  it('transfer data to tab3', async() => {
    const service: PeersService = TestBed.get(PeersService);
    const message: Message = await service.connectToEndpoint(this.endpoints[2]);
    let hasDoc = false;
    await tab3.get('supercat').then(function (doc) {
      console.log(doc);
      hasDoc = true;
    });
    expect(hasDoc).toEqual(true);
  });


});
