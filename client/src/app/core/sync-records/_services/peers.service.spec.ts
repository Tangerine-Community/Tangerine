import {inject, TestBed} from '@angular/core/testing';

import { PeersService } from './peers.service';
import PouchDB from 'pouchdb';
import {Endpoint} from '../peers/endpoint';
import {Message} from '../peers/message';
import {MOCK_ENDPOINTS} from '../peers/mock-endpoints';
import {UserService} from "../../../shared/_services/user.service";
import {Inject} from "@angular/core";
import {DEFAULT_USER_DOCS} from "../../../shared/_tokens/default-user-docs.token";
import {AppConfigService} from "../../../shared/_services/app-config.service";
import {HttpClient, HttpClientModule} from "@angular/common/http";

let supercat: PouchDB;
let tab1: PouchDB;
let tab2: PouchDB;
let tab3: PouchDB;
let currentEndpoint: Endpoint;
// let peerService: PeersService;
class MockPeersService {
  // peerService: PeersService = new PeersService(new UserService(@Inject({provide: DEFAULT_USER_DOCS, useValue: [], multi: true}), @Inject(AppConfigService), @Inject(HttpClient)));
  endpoint: Endpoint;
  endpoints: Endpoint[] = [];
  messageType: string;
  isMaster = false;
  el: any  = document.createElement('div');
  localDatabase: PouchDB;
  currentEndpoint: Endpoint;
  peer: Endpoint;
  // peerService: PeersService;
  // constructor(
  //   private peerService: PeersService
  // ) {
  // }

  // constructor(@Inject(PeersService) public realPeerService: PeersService, @Inject(UserService) public userService: UserService) {}
  // constructor(@Inject(PeersService) public realPeerService: PeersService) {}

  async getTangyP2PPermissions() {
    const message: Message = new Message('log', 'OK', null, null, null, null);
    return message;
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
      // const msg: Message = <Message>response.object;
      const msg = <Message>response.object;
      const payload = msg.payloadData;
      // const payload = msg.object;
      // const databaseDump = atob(base64dump);
      // const databaseDump = await (new Response(blob)).text();
      const writeStream = new window['Memorystream'];
      writeStream.end(payload);
      const tempDb = new PouchDB('tempDb');
      console.log('Loading data into tempDb');
      await tempDb.load(writeStream).then(async () => {
        // replicate received database to the local db
        // await new Promise((resolve, reject) => {
        const localDb = this.localDatabase;
        console.log('Replicating data to PouchDB: ' + localDb.name);
        await tempDb.replicate.to(localDb)
          .on('complete',  () => {
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
      }).catch((err) => {
        console.log(err);
        message = new Message('error', err, null, null, null, null);
        const event = new CustomEvent('error', {detail: message});
        this.el.dispatchEvent(event);
      });
    }
  };

  successAdvert = (response: Message) => {
    // PeersService.successAdvert(response: Message);
    // let peersServiceSpy: jasmine.SpyObj<PeersService>;
    return this.successAdvertising(response);
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

  async startAdvertising() {
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
      response = new Message(this.messageType, 'Endpoints', obj, null, null, null);
    }
    // else if (this.messageType === 'payload') {
    //   const pluginMessage = 'I loaded data from the peer device. Now I will send you my data.';
    //   response = new Message(this.messageType, pluginMessage, null);
    // }

    return this.successAdvert(response);
  }

  async connectToEndpoint(endpoint) {
    currentEndpoint = endpoint;
    const dumpedString = await this.dumpData(supercat);
    // const message: Message = await this.pushData(dumpedString);
    const message: Message = new Message('payload', 'Data from master', dumpedString, null, null, null);
    await this.pushData(message, dumpedString);
    // return message;
  }

  // async pushData(dumpedString): Promise<Message> {
  async pushData(message: Message, payload: string) {
    const dumpedString = payload;
    // TODO: this would have been caught in startAdvertising normally
    // const payload: Message = <Message>response.object;
    // const databaseDump = payload.object;
    const writeStream = new window['Memorystream'];
    writeStream.end(dumpedString);
    const temp = new PouchDB('tempDb');
    const dest = new PouchDB(currentEndpoint.id);
    const resultMessage = temp.load(writeStream).then(async () => {
      // replicate received database to the local db
      await temp.replicate.to(dest).on('complete', function () {
        console.log('done! ' );
      }).on('error', function (err) {
        console.log('error: ' + err);
      });

      const dumpedString = await this.dumpData(dest)
      let pushDataMessage: Message;
        // TODO - should be a confirmation that *some* data was sent - a proof of life
        // TODO at this point, he can move to another peer.
        const doneMessage = 'Data has been loaded. You may sync the next device.'
        message = new Message('done', doneMessage, null, null, null, null);
        const event = new CustomEvent('done', {detail: message});
        this.el.dispatchEvent(event);
        return message;
    }).catch((err) => {
      console.log(err);
      message = new Message('error', err, null, null, null, null);
      const event = new CustomEvent('error', {detail: message});
      this.el.dispatchEvent(event);
    });
    return resultMessage;
  }

}

/*
describe('PeersService', () => {
  let endpoints: Endpoint[] = [];
  beforeEach(
    () => {
      const originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    // inject([UserService, PeersService], (uService, pService) => {
      TestBed.configureTestingModule({
        imports  : [
          HttpClientModule
        ],
        providers: [
          {provide: PeersService, useClass: MockPeersService},
          // PeersService,
          // UserService,
          {provide: DEFAULT_USER_DOCS, useValue: [], multi: true},
          AppConfigService
        ]
      });
      // this.peerService = pService;
      const service = TestBed.get(PeersService);

      PouchDB.plugin(window['PouchReplicationStream'].plugin);
      PouchDB.adapter('writableStream', window['PouchReplicationStream'].adapters.writableStream);
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

      endpoints = [];
      if (typeof service.el  === 'undefined') {
        service.el = document.createElement('div');
      }
      const startAdvertisingBtnEl = service.el;
      startAdvertisingBtnEl.addEventListener('log', e => {
          console.log('log message: ' + JSON.stringify(e.detail));
        }
      );
      startAdvertisingBtnEl.addEventListener('localEndpointName', e => {
          console.log('localEndpointName: ' + JSON.stringify(e.detail));
        }
      );
      startAdvertisingBtnEl.addEventListener('endpoints', e => {
          console.log('endpoints: ' + JSON.stringify(e.detail));
          const message: Message = e.detail;
          endpoints = message.object;
        }
      );
      startAdvertisingBtnEl.addEventListener('payload', e => {
          console.log('payload: ' + JSON.stringify(e.detail));
        }
      );
      startAdvertisingBtnEl.addEventListener('done', e => {
          console.log('Current peer sync complete: ' + JSON.stringify(e.detail));
        }
      );
      startAdvertisingBtnEl.addEventListener('error', e => {
          console.log('stinky error: ' + JSON.stringify(e.detail));
        }
      );
    }
  );

  afterEach(async () => {
    const supercatT = new PouchDB('supercat');
    await supercatT.destroy();

    const tab1T = new PouchDB('tab1');
    await tab1T.destroy();

    const tab2T = new PouchDB('tab2');
    await tab2T.destroy();

    const tab3T = new PouchDB('tab3');
    await tab3T.destroy();

  });

  it('should be created', () => {
    const service: PeersService = TestBed.get(PeersService);
    expect(service).toBeTruthy();
  });


  it('got permissions', async () => {
    const service: PeersService = TestBed.get(PeersService);
    const message: Message = await service.getTangyP2PPermissions();
    expect(message.message).toEqual('OK');
  });

  // it('start advertising', inject([UserService, PeersService], async(uService: UserService, realPeersService: PeersService)  => {
  it('start advertising', async()  => {
    // this.peerService = realPeersService;
    const service: PeersService = TestBed.get(PeersService);
    endpoints = [];
    await service.startAdvertising(endpoints);
    // this.endpoints = message.object;

    // TODO: test the events dispatched by startAdvertising
    // expect(this.endpoints.length).toEqual(3);
  });
  // }));

  // endpoints: [{"id":"tab1","endpointName":"tab1"},{"id":"tab2","endpointName":"tab2"},{"id":"tab3","endpointName":"tab3"}]

  it('transfer data to tab1', async() => {
    const service: PeersService = TestBed.get(PeersService);
    const ep1 = {'id': 'tab1', 'endpointName': 'tab1'};
    // const message: Message = await service.connectToEndpoint(this.endpoints[0]);
    const message: Message = await service.connectToEndpoint(ep1);
    let hasDoc = false;
    await tab1.get('supercat').then(function (doc) {
      console.log(doc);
      hasDoc = true;
    });
    expect(hasDoc).toEqual(true);
  });

  // it('get data from tab 1', async() => {
  //   const service: PeersService = TestBed.get(PeersService);
  //   this.endpoints = [];
  //   await service.startAdvertising(this.endpoints);
  //   // this.endpoints = message.object;
  //
  //   // expect(this.endpoints.length).toEqual(3);
  // });

  // it('transfer data to tab2', async() => {
  //   const service: PeersService = TestBed.get(PeersService);
  //   const message: Message = await service.connectToEndpoint(this.endpoints[1]);
  //   let hasDoc = false;
  //   await tab2.get('supercat').then(function (doc) {
  //     console.log(doc);
  //     hasDoc = true;
  //   });
  //   expect(hasDoc).toEqual(true);
  // });
  //
  // it('transfer data to tab3', async() => {
  //   const service: PeersService = TestBed.get(PeersService);
  //   const message: Message = await service.connectToEndpoint(this.endpoints[2]);
  //   let hasDoc = false;
  //   await tab3.get('supercat').then(function (doc) {
  //     console.log(doc);
  //     hasDoc = true;
  //   });
  //   expect(hasDoc).toEqual(true);
  // });

});
*/
